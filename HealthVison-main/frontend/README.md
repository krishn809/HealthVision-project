# HealthVision Frontend

A modern, responsive, and interactive React frontend for the HealthVision platform, featuring dynamic appointments, secure AI medical report analysis, real-time chatbots, and peer-to-peer video consultations.

---

## 🚀 Tech Stack & Dependencies

### Core UI & Build
- **React 18**: Component-based UI rendering.
- **Vite**: Ultra-fast frontend build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework for rapid and responsive styling.
- **Framer Motion**: Production-ready animation library for smooth UI transitions.
- **Lucide React**: Beautiful and consistent SVG icons.

### State & Routing
- **React Router DOM**: Client-side routing with protected route guards and layouts.
- **React Hot Toast**: Elegant and accessible toast notifications for user feedback.

### Integrations & Services
- **Axios**: Promise-based HTTP client for all API interactions (`services/api.js`).
- **Socket.io-client**: Real-time bidirectional communication connection to the backend.
- **Simple-peer**: WebRTC abstraction for direct P2P video calls (`pages/VideoConsultation.jsx`).
- **Razorpay SDK**: Secure client-side checkout for appointment payments.

---

## 🔄 System Flows

### 1. Authentication & Onboarding
**Implementation**: `pages/Login.jsx`, `pages/Signup.jsx`, `components/PublicRoute.jsx`
```text
Public Routes (/, /login, /signup, /doctors, /doctors)
    │
    ├─► Valid Auth ───► Redirect to `/dashboard` (for login/signup)
    │
    └─► Submit Credentials ──► Save JWT in localStorage
                                      │
                                      ▼
Dashboard Access ◄──── Complete Profile Details (if required)
```

### 2. Appointment Booking & Checkout
**Implementation**: `pages/AppointmentBooking.jsx`, `pages/PaymentSuccess.jsx`, `components/DoctorCard.jsx`
```text
Browse Doctors (/doctors) ───► Doctor Profile (/doctors/:id)
                                      │
                                      ▼
Select Available Timeslot ◄─── Calendar UI Component
    │
    ▼
Razorpay Modal Opens ───► Pre-fill Amount & Details
    │
    ├─── Payment Success ───► Redirect to `/appointments/payment-success`
    │
    └─── Payment Failure ───► Redirect to `/appointments/payment-failure`
```

### 3. AI Medical Report Dashboard
**Implementation**: `pages/ReportUpload.jsx`, `pages/ReportAnalysis.jsx`, `pages/Reports.jsx`
```text
Upload PDF/Image (Drag & Drop) ───► Upload Progress UI
                                          │
                                          ▼
View Analysis Results ◄─── Polling/Wait for ML Backend Parse
    │
    ▼
Click "Discuss with AI" ───► Continues to Chatbot Context
```

### 4. Interactive Symptom Chatbot
**Implementation**: `pages/Chatbot.jsx`
```text
Input Symptoms / Query ───► Send Message to AI Service
    │
    ▼
Receive Structured Response (Urgency Badge + Advice)
    │
    ▼
Append to Chat History (Real-time Scroll)
    │
    └────► If Urgency == High ──► Prompt "Book Appointment Now"
```

### 5. Peer-to-Peer Video Call
**Implementation**: `pages/VideoConsultation.jsx`
```text
Click "Join Call" (from Dashboard) ───► Request Camera/Mic Permissions
                                                │
                                                ▼
Socket Signaling (Room Join) ───► Initialize SimplePeer Instance
                                                │
                                                ▼
Render Remote Video Stream ◄─── Establish P2P Connection
```

---

## 📄 Documentation & Setup
- **Environment**: See `.env.example` requirements (API endpoints, Razorpay Key).
- **Development**: Run `npm install` followed by `npm run dev` to start the local Vite server.
