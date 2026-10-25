# 👥 Team Roles & Responsibilities

This document outlines the distribution of tasks for the **HealthVision** project based on the development timeline and project details.

## 👨‍💻 Team Members

| Name | GitHub Profile |
| :--- | :--- |
| **Akhil Pandey** | [@Akhil9648](https://github.com/Akhil9648) |
| **Aditya Pratap Singh** | [@aditya2005-code](https://github.com/aditya2005-code) |
| **Rishi Tiwari** | [@rishi-tiwari023](https://github.com/rishi-tiwari023) |

## 👨‍💻 Team Mapping

| Role | Primary Assignees |
| :--- | :--- |
| **Frontend Developer** | [Rishi](https://github.com/rishi-tiwari023) |
| **Backend + DB Developer** | [Rishi](https://github.com/rishi-tiwari023), [Akhil](https://github.com/Akhil9648) |
| **ML-Service with Fast API** | [Aditya](https://github.com/aditya2005-code) |

---

## 🎨 Frontend Developer (Rishi)

### Responsibilities:
- **Phase 1: Foundation & Auth**
    - Initialize React project with Vite & setup project structure.
    - Implement Login/Signup UI with form validation.
    - Create protected route wrappers and JWT storage logic.
    - Setup layout (Header, Footer, Sidebar).
- **Phase 2: Dashboard & Core UI**
    - Design and implement Report Upload UI with drag-and-drop.
    - Build the User Dashboard with interactive charts (Chart.js/Recharts).
    - Develop the Symptom Chatbot interface with urgency indicators.
- **Phase 3: Appointments & Payments**
    - Create the Appointment Booking flow (Calendar, Timeslot selection).
    - Integrate Payment Gateway (Razorpay/Stripe) frontend components.
    - Implement appointment management (cancel/reschedule UI).
- **Phase 4: Communication & Polish**
    - Build Video Consultation interface using WebRTC.
    - Ensure responsive design across mobile, tablet, and desktop.
    - Final UI polish and accessibility improvements.

---

## ⚙️ Backend + DB Developer (Rishi, Akhil)

### Responsibilities:
- **Phase 1: API Foundation & Auth**
    - Initialize Node.js/Express server and connect to MongoDB.
    - Implement JWT-based authentication system & middleware.
    - Design User and Doctor schemas; create seeding scripts.
- **Phase 2: Report & Chatbot Logic**
    - Implement Report Upload endpoint and file storage system.
    - Develop Dashboard stats aggregation APIs.
    - Create ChatMessage schema and history retrieval endpoints.
    - Integrate with the AI/ML API for report analysis.
- **Phase 3: Transactional Systems**
    - Build the Timeslot management and Appointment booking logic.
    - Implement Payment initiation and Webhook handlers.
    - Add appointment cancellation and rescheduling backend logic.
- **Phase 4: Real-time & Security**
    - Setup Socket.io for WebRTC signaling and presence tracking.
    - Perform security audits, input sanitization, and database indexing.
    - Setup backup and recovery procedures.

---

## 🤖 ML-Service with Fast API (Aditya)

### Responsibilities:
- **Phase 1: Model Research & Setup**
    - Setup Python environment (FastAPI/Flask) for the ML API.
    - Research and select OCR libraries (Tesseract/PyMuPDF).
    - Design classification model architecture for disease detection.
- **Phase 2: Intelligence Integration**
    - Build the OCR text extraction module for medical reports.
    - Develop disease prediction models (Dengue, Typhoid, Viral Fever).
    - Implement Symptom Urgency classification logic (NLP/Rule-based).
- **Phase 3: Refinement & Documentation**
    - Optimize model inference speed and accuracy.
    - Document ML API endpoints and usage guides.
    - Implement model versioning and backup.
- **Phase 4: Deployment & Scaling**
    - Deploy ML services to cloud/server environments.
    - Implement health check endpoints and monitoring.
    - Validate model performance with production-like data.
