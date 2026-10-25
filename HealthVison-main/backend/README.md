# HealthVision Backend

A robust and scalable Node.js backend for the HealthVision platform, providing medical services, appointment management, secure payments, and AI-driven report analysis.

---

## 🚀 Tech Stack & Dependencies

### Core
- **Node.js & Express**: Fast, unopinionated, minimalist web framework.
- **MongoDB & Mongoose**: NoSQL database for flexible data modeling.
- **Socket.io**: Real-time, bidirectional signaling for video calls.

### Security
- **JSON Web Tokens (JWT)**: Secure authentication and authorization (`utils/generateToken.js`).
- **Bcrypt**: Password hashing (`models/user.model.js`).
- **Helmet**: Security headers for Express (`index.js`).
- **Express Rate Limit**: Protection against brute-force attacks (`index.js`).

### Third-Party Integrations
- **Razorpay**: Payment gateway for INR transactions (`config/razorpay.js`).
- **Resend**: Transactional email delivery (`utils/sendEmail.js`).
- **Cloudinary**: Cloud storage for medical reports and images (`config/cloudinary.js`).
- **ImageKit**: Specialized image processing for avatars (`utils/imagekit.js`).
- **External ML APIs**: Microservices for report analysis and chatbot intelligence (`services/ml.service.js`).

---

## 🔄 System Flows

### 1. Authentication & Onboarding
**Implementation**: `controllers/auth.controller.js`, `routes/auth.routes.js`, `models/user.model.js`
```text
User Signup (Patient/Doctor) 
    │
    ▼
Upload Avatar (ImageKit) ────► Save User Profile (MongoDB)
    │                               │
    │                               ▼
    └────────────────────────── Generate OTP 
                                    │
                                    ▼
Verified JWT Token ◄────────── Email OTP (Resend)
```

### 2. Appointment Booking & Payment
**Implementation**: `controllers/appointment.controller.js`, `routes/appointment.routes.js`, `models/timeslot.model.js`
```text
Select Doctor & Slot
    │
    ▼
Create Pending Appointment ───► Mark Slot "Pending"
    │                               │
    ▼                               │
Initiate Payment (Razorpay/Wallet/Hybrid)
    │
    ├─── Success ───► Mark Slot "Booked" & Send Confirmation Email
    │
    └─── Failure ───► Release Slot after 15m Timeout
```

### 3. Payment Models
**Implementation**: `controllers/payment.controller.js`, `routes/payment.routes.js`, `utils/verifySignature.js`
- **Razorpay**: User ───► Razorpay Order ───► Signature Verified ───► Success
- **Wallet**: User ───► Check Balance ───► Deduct ───► Success
- **Hybrid**: User ───► (Wallet Part) + (Razorpay Part) ───► Combined Verify ───► Success

### 4. Medical Report Analysis
**Implementation**: `controllers/report.controller.js`, `routes/report.routes.js`, `services/ml.service.js`
```text
Upload PDF/Image ───► Cloudinary ───► Save Report Meta (DB)
                                          │
                                          ▼
Chatbot Response ◄─── Analysis Data ◄─── ML Microservice Analysis
```

### 5. Peer-to-Peer Video Call
**Implementation**: `controllers/webrtc.controller.js`, `services/socket.service.js`, `routes/webrtc.routes.js`
```text
Patient/Doctor Join Room
    │
    ▼
Socket.io Registration ───────► Room Created (Consultation DB)
    │                               │
    ▼                               │
Exchange WebRTC Signaling (Offer/Answer/ICE) ◄───┐
    │                                            │
    ▼                                            │
Direct P2P Video/Audio Stream ───────────────────┘
```

### 6. Email Communication Triggers
- **Signup** ─────► `OTP Verification Email` (`controllers/auth.controller.js`)
- **Booked** ─────► `Appointment Confirmation` (`controllers/payment.controller.js`)
- **Move**   ─────► `Rescheduling Alert` (`controllers/appointment.controller.js`)
- **Cancel** ─────► `Cancellation & Refund Notice` (`controllers/appointment.controller.js`)

---

## 📄 Documentation
- **Swagger UI**: Access via `{{BASE_URL}}/api-docs` (`config/swagger.js`)
- **Environment**: See `.env.example` for configuration details.
