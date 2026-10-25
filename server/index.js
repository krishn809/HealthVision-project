require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/files");
const conversationRoutes = require("./routes/conversations");
const bloodReportRoutes = require("./routes/bloodReports");
const seedDemoData = require("./seedDemo");

const MongoDBStore = require("connect-mongodb-session")(session);

const app = express();

async function startServer() {
    // 1. Establish database connection (external or embedded in-memory)
    const mongoUri = await connection();

    // Seed demo data for Krishn Kushwaha
    await seedDemoData();

    // 2. Middlewares
    app.use(express.json());
    app.use(cors());

    // 3. Session config with MongoDB store
    const store = new MongoDBStore({
        uri: mongoUri || process.env.MONGODB_URI,
        collection: "sessions"
    });

    store.on("error", function (error) {
        console.warn("MongoDB Session Store Warning:", error.message || error);
    });

    app.use(
        session({
            secret: process.env.JWTPRIVATEKEY || "elixer_ai_jwt_secret_key_2024",
            resave: false,
            saveUninitialized: true,
            cookie: {
                secure: false, // Set to true if using HTTPS
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
            },
            store: store
        })
    );

    // 4. API Routes
    app.use("/api/users", userRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/files", fileRoutes);
    app.use("/api/conversations", conversationRoutes);
    app.use("/api/bloodreport", bloodReportRoutes);

    // Profile endpoint alias for spatial dashboard
    app.get("/api/profile", async (req, res) => {
        try {
            const authHeader = req.headers["authorization"] || req.header("Authorization");
            if (!authHeader) {
                return res.json({ firstName: "Krishn", lastName: "Kushwaha", progress: 85 });
            }
            const token = authHeader.replace("Bearer ", "");
            const secret = process.env.JWTPRIVATEKEY || "elixer_ai_jwt_secret_key_2024";
            const jwt = require("jsonwebtoken");
            const decoded = jwt.verify(token, secret);
            const { User } = require("./models/user");
            const user = await User.findById(decoded._id).select("-password");
            if (!user) {
                return res.json({ firstName: "Krishn", lastName: "Kushwaha", progress: 85 });
            }
            const totalFields = 5;
            const completedFields = ["age", "height", "weight", "ethnicity", "sex"].filter(k => user[k]).length;
            const progress = Math.round((completedFields / totalFields) * 100);
            res.json({ ...user.toObject(), progress });
        } catch (e) {
            res.json({ firstName: "Krishn", lastName: "Kushwaha", progress: 85 });
        }
    });

    // Health check endpoint
    app.get("/api/health", (req, res) => {
        res.status(200).json({ status: "ok", message: "Health Vision API is healthy and operational" });
    });

    const port = process.env.PORT || 8080;
    app.listen(port, () => console.log(`Elixer AI Backend Server listening on port ${port}...`));
}

startServer().catch((err) => {
    console.error("Fatal startup error:", err);
    process.exit(1);
});
