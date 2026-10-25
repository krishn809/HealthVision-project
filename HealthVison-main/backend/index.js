import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import helmet from 'helmet';
import morgan from 'morgan';
import { specs } from './src/config/swagger.js';
import { errorHandler, notFoundHandler } from './src/middleware/error.middleware.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import doctorRoutes from './src/routes/doctor.routes.js';
import appointmentRoutes from './src/routes/appointment.routes.js';
import reportRoutes from './src/routes/report.routes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';
import chatbotRoutes from './src/routes/chatbot.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import webrtcRoutes from './src/routes/webrtc.routes.js';
import { webhookController } from './src/controllers/payment.controller.js';
import { setupSocket } from './src/services/socket.service.js';
import logger from './src/utils/logger.js';

const app = express();

// Trust proxy for express-rate-limit behind reverse proxies (e.g. Render)
app.set('trust proxy', 1);

const server = http.createServer(app);

// Initialize Socket.io
setupSocket(server);

// Custom NoSQL Injection Sanitizer
const nosqlSanitizer = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      Object.keys(obj).forEach(key => {
        if (key.startsWith('$')) {
          logger.warn(`NoSQL injection attempt detected and sanitized: ${key}`);
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      });
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
};

// CORS configuration - allowing origins including the env current FRONTEND_URL
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://www.healthviz.in',
  'https://healthviz.in',
  'https://health-vison.vercel.app'
].filter(Boolean).map(url => url.trim().replace(/\/$/, ""));

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or cron jobs)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.includes('*');
    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn(`Blocked by CORS: origin ${origin} not in list: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Global Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(nosqlSanitizer);
app.use(express.json());

// Custom Morgan token for browser detection
morgan.token('browser', (req) => {
  const ua = req.headers['user-agent'] || '';
  const secChUa = req.headers['sec-ch-ua'] || '';
  const gpc = req.headers['sec-gpc'] || '';

  if (ua.includes('Brave') || secChUa.includes('Brave') || gpc === '1') return 'Brave';
  if (ua.includes('Edg/') || secChUa.includes('Edge')) return 'Edge';
  if (ua.includes('Chrome/') || secChUa.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('MSIE') || ua.includes('Trident/')) return 'IE';
  return 'Other';
});

app.use(morgan(':remote-addr :method :url :status :browser', { stream: { write: message => logger.info(message.trim()) } }));

// Ports and Database URIs
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthvision';

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => logger.info('MongoDB Connected'))
  .catch((err) => logger.error('MongoDB Connection Error: %o', err));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health-check / Root routes
app.get('/', (req, res) => {
  res.send('HealthVision API is running');
});

app.get('/api', (req, res) => {
  res.json({ message: 'HealthVision API is running and secure', status: 'success' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  webhookController
);

app.use('/api/payment', paymentRoutes);
app.use('/api/webrtc', webrtcRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Listen
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

