# 🏥 HealthVision

**Live Project:** [Healthvision](https://healthviz.in)  
**Status:** ✅ Completed (MVP)

---

### 📖 Project Documentation
- **[Frontend Documentation](./frontend/README.md)**
- **[Backend Documentation](./backend/README.md)**

---

A comprehensive MedTech web application built with the MERN stack and integrated AI/ML capabilities for medical report analysis, appointment booking, and telemedicine consultations.

## 📋 Project Overview

HealthVision provides users with a simple, accessible digital health platform where they can:
- Analyze medical reports using AI/ML
- Interact with a symptom chatbot for urgency assessment
- Book appointments with doctors
- Conduct video consultations via WebRTC
- Make secure payments for consultations

## 🏗️ Project Structure

```
HealthVision/
├── frontend/              # React.js frontend application (Vite + Tailwind)
├── backend/              # Node.js/Express backend API (MongoDB + Socket.io)
├── healthvision-chatbot/  # Independent symptom chatbot service (Python)
├── ml-service/           # Python AI/ML service for report analysis
└── team-docs/           # Project documentation & design assets
```

## 🚀 Tech Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: TailwindCSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **WebRTC**: Socket.io-client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io (for WebRTC signaling)
- **Payment**: Razorpay (Live Mode)

### AI/ML Service
- **Framework**: FastAPI/Flask
- **OCR**: Tesseract/PyMuPDF
- **ML Libraries**: scikit-learn, pandas, numpy
- **NLP**: For symptom analysis

## 👥 Team

| Name | Role | GitHub |
|------|------|--------|
| **Akhil Pandey** | Backend + DB | [@Akhil9648](https://github.com/Akhil9648) |
| **Aditya Pratap Singh** | Ml-Service + HealthVison-Chatbot | [@aditya2005-code](https://github.com/aditya2005-code) |
| **Rishi Tiwari** | Frontend, Backend + DB | [@rishi-tiwari023](https://github.com/rishi-tiwari023) |

## 📚 Documentation

For detailed information about the project, please refer to:
- [Project Overview](./team-docs/PROJECT_OVERVIEW.md) - MVP features, tech stack, and system design
- [Team Roles](./team-docs/TEAM_ROLES.md) - Responsibilities and task distribution
- [Development Timeline](./team-docs/DEVELOPMENT_TIMELINE.md) - 1-month development schedule

## 🔧 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- Python (v3.8+)
- Git

### Installation

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### ML Service
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## 🌟 Key Features

### 1. User Authentication
- Secure JWT-based authentication
- Protected routes and role-based access

### 2. Report Analysis (AI/ML)
- Upload medical reports (PDF/Image)
- OCR text extraction
- Disease pattern detection (Dengue, Typhoid, Viral Fever)

### 3. Symptom Chatbot
- Interactive symptom description
- Urgency level classification
- Consultation recommendations

### 4. Appointment Booking
- Doctor selection and availability
- Timeslot management
- Appointment confirmation

### 5. Payment Integration (Razorpay)
- **Secure Processing**: Integrated Razorpay Checkout JS for seamless frontend payments.
- **Order Generation**: Express backend securely generates Order IDs and authenticates transactions.
- **Signature Verification**: Server-side webhook and crypto HMAC signature validation.
- **User Experience**: Automatic sync with database state for instantly confirmed appointment statuses.
- **Consultation Fee**: Dynamic pricing retrieved from database models.
### 6. Video Consultation
- WebRTC-based real-time communication
- Voice and video calls
- Basic call controls

## 🔑 Environment Configuration

The project relies on environment variables for secure configuration. Both the frontend and backend require a `.env` file in their respective directories based on the provided templates.

### Frontend Environment (`frontend/.env.example`)
- `VITE_API_URL`: Points to the Node.js API 
- `VITE_RAZORPAY_KEY_ID`: Public key for the Razorpay Checkout integration.

### Backend Environment (`backend/.env.example`)
- **Database**: `MONGODB_URI` for the MongoDB Atlas or local connection.
- **Authentication**: `JWT_SECRET` for secure token signing and `JWT_EXPIRE`.
- **Email (Resend)**: `RESEND_API_KEY` for transactional system emails.
- **Cloud Storage**: `CLOUDINARY_URL` (or discrete name/key/secret) for report hosting.
- **Payments**: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` for server-side verification.
- **Microservices**: `ML_API_URL` to connect with the FastAPI ML engine.

## 🌐 Deployment

HealthVision is architected as a distributed system with optimal hosting across different platforms:

- **Frontend (Vite)**: Deployed on **Vercel** for ultra-fast edge delivery.
- **Backend (Node.js)**: Hosted on **Render** (Web Service).
- **ML Microservice (FastAPI)**: Hosted on **Render** (Independent Service).
- **Symptom Chatbot**: Hosted on **Render** (Autonomous Service).
- **Domain Management**: Custom domain `healthviz.in` configured via **GoDaddy**.

## 🔄 Development Workflow

## �🔄 Development Workflow

- **Branching Strategy**: Feature-based branching
- **Code Review**: Pull requests required for merging
- **Testing**: Continuous testing throughout development
- **Communication**: Daily standups and async updates

## Troubleshooting

### Common Issues

#### 1. "Report Not Found" at `/reports/analysis`
If you see a "Report Not Found" error when visiting `http://localhost:5173/reports/analysis`, this is expected behavior.
- **Cause**: The URL `/reports/analysis` tries to load a report with the ID "analysis", which does not exist.
- **Solution**: Use the correct URL format: `/reports/:reportId` (e.g., `/reports/65d4...`). You can navigate to specific reports from the **Reports** page or **Dashboard**.

#### 2. Duplicate Backend Logs in Development
In the backend console, you may notice that every request from the frontend is logged twice.
- **Cause**: The frontend is running in **React Strict Mode** (enabled in `frontend/src/main.jsx`). In development, React intentionally mounts components twice to help identify side effects, which triggers duplicate API calls.
- **Note**: This behavior is restricted to the development environment and will not occur in the production build.

#### 3. Frontend Still Hitting Old Backend Code or Cached Render APIs
If you pull in backend changes (like switching to Cloudinary or new MongoDB routes) and testing them locally still shows the old logic:
- **Cause**: Your backend server needs to be fully restarted, or your browser is making requests to a cached URL on Render instead of localhost.
- **Solution**: 
  1. Stop your local Node server (`Ctrl+C`) and start again: `npm run dev`.
  2. Perform a Hard Refresh on your frontend (`Ctrl + F5` or `Shift + F5` on Windows).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Please refer to the [Development Timeline](./team-docs/DEVELOPMENT_TIMELINE.md) for task assignments and contribution guidelines.

---

**Built with ❤️ by Team HealthVision**
