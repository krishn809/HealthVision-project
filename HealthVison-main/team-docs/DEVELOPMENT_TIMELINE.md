# 📅 HealthVision MVP - 1 Month Development Timeline

**Team Structure:**
- **Frontend Developer:** React.js UI/UX development
- **Backend + DB Developer:** Node.js/Express APIs & MongoDB
- **AI/ML Developer:** Python models, OCR, chatbot integration

---

## 📊 Phase Overview

| Phase | Duration | Focus Area |
|-------|----------|------------|
| **Phase 1: Foundation & Setup** | Days 1-7 | Project setup, authentication, database design |
| **Phase 2: Core Features I** | Days 8-14 | Public pages, dashboard, report analysis foundation |
| **Phase 3: Core Features II** | Days 15-17 | Appointments, symptom chatbot (Paused at Day 17) |
| **Phase 4: Project Wrap-Up**| Days 18-23 | Payments, WebRTC, final testing, deployment |

---

## 🚀 Phase 1: Foundation & Setup (Days 1-7)

### Day 1
**Frontend:**
- Initialize React project with Vite
- Setup project structure (components, pages, utils, services)
- Install dependencies (React Router, Axios, TailwindCSS/Material-UI)
- Create basic layout components (Header, Footer, Sidebar)
- Setup routing structure

**Backend + DB:**
- Initialize Node.js/Express project
- Setup project structure (routes, controllers, models, middleware)
- Install dependencies (express, mongoose, dotenv, cors)
- Connect to MongoDB (local setup)
- Create basic server configuration
- Setup environment variables

**AI/ML:**
- Setup Python environment (virtualenv/conda)
- Install required libraries (pandas, numpy, scikit-learn, pytesseract, PIL)
- Research and select OCR library (Tesseract/PyMuPDF)
- Setup basic Flask/FastAPI structure for ML API
- Create initial project structure

### Day 2
**Frontend:**
- Design and implement login page UI
- Design and implement signup page UI
- Create form validation components
- Setup API service layer for authentication calls

**Backend + DB:**
- Design User schema (name, email, password, role, createdAt)
- Implement user registration endpoint (POST /api/auth/register)
- Implement password hashing with bcrypt
- Create JWT token generation utility
- Test registration endpoint with Postman

**AI/ML:**
- Research disease prediction models (dengue, typhoid, viral fever)
- Collect sample medical report data structure
- Design ML model architecture (classification approach)
- Setup data preprocessing pipeline structure

### Day 3
**Frontend:**
- Implement login form functionality
- Connect login to backend API
- Setup JWT token storage (localStorage/sessionStorage)
- Create protected route wrapper component
- Implement logout functionality

**Backend + DB:**
- Implement login endpoint (POST /api/auth/login)
- Create JWT authentication middleware
- Implement protected route middleware
- Test authentication flow end-to-end
- Create user profile endpoint (GET /api/users/me)

**AI/ML:**
- Start building OCR text extraction function
- Test OCR on sample medical report images
- Create function to parse extracted text
- Design data structure for extracted report data

### Day 4
**Frontend:**
- Create dashboard layout structure
- Design dashboard navigation tiles
- Implement basic dashboard page with placeholder content
- Add user profile display component

**Backend + DB:**
- Design Doctor schema (name, specialization, experience, rating, availability, fee)
- Create doctor seeding script with sample data
- Implement GET /api/doctors endpoint (public listing)
- Implement GET /api/doctors/:id endpoint (doctor details)
- Test doctor endpoints

**AI/ML:**
- Continue OCR development and testing
- Start building basic disease classification model
- Prepare training data structure
- Begin model training (if using supervised learning)

### Day 5
**Frontend:**
- Implement public doctors listing page (no auth required)
- Create doctor card component
- Add doctor detail view page
- Implement search/filter functionality for doctors

**Backend + DB:**
- Design Appointment schema (userId, doctorId, date, time, status, paymentStatus)
- Create appointment endpoints structure
- Implement GET /api/appointments (user's appointments)
- Add appointment validation logic

**AI/ML:**
- Complete OCR text extraction module
- Continue model training/development
- Create API endpoint structure for report analysis
- Test OCR on various report formats (PDF, images)

### Day 6
**Frontend:**
- Polish authentication UI/UX
- Add loading states and error handling
- Implement form validation feedback
- Test complete authentication flow

**Backend + DB:**
- Add input validation and error handling
- Implement password reset structure (optional for MVP)
- Add rate limiting for auth endpoints
- Write API documentation (Swagger/Postman collection)

**AI/ML:**
- Finalize OCR module
- Complete disease prediction model (basic version)
- Create model inference function
- Test model with sample data

### Day 7
**All Roles:**
- Code review and merge authentication feature branch
- Integration testing of auth flow
- Fix any bugs or issues
- Plan next phase tasks

---

## 🔨 Phase 2: Core Features I (Days 8-14)

### Day 8
**Frontend:**
- Design report upload page UI
- Implement file upload component (drag & drop)
- Add file validation (PDF, image formats)
- Create upload progress indicator

**Backend + DB:**
- Design Report schema (userId, fileUrl, extractedText, analysisResult, createdAt)
- Implement file upload endpoint (POST /api/reports/upload)
- Setup file storage (local/cloud storage)
- Create report storage endpoint

**AI/ML:**
- Integrate OCR with backend API
- Create endpoint: POST /api/ml/extract-text (OCR)
- Test OCR API with various file formats
- Handle error cases in OCR processing

### Day 9
**Frontend:**
- Design report analysis results page
- Create result display component
- Add loading states for analysis
- Connect report upload to backend

**Backend + DB:**
- Create report analysis endpoint (POST /api/reports/analyze)
- Integrate with ML API for text extraction
- Store analysis results in database
- Implement GET /api/reports (user's reports history)

**AI/ML:**
- Create disease prediction API endpoint
- Integrate model inference with backend
- Return structured results (disease probabilities, summary)
- Test end-to-end: upload → OCR → prediction

### Day 10
**Frontend:**
- Implement dashboard with navigation tiles
- Add quick stats cards (appointments count, reports analyzed)
- Create simple charts using Chart.js/Recharts
- Design appointment history component

**Backend + DB:**
- Create dashboard stats endpoint (GET /api/dashboard/stats)
- Aggregate user data (appointments, reports, consultations)
- Optimize queries for dashboard
- Add caching if needed

**AI/ML:**
- Refine disease prediction model accuracy
- Add confidence scores to predictions
- Create result summary generation function
- Test with edge cases

### Day 11
**Frontend:**
- Design symptom chatbot UI component
- Create chat interface (message bubbles, input field)
- Add typing indicators
- Implement chat history display

**Backend + DB:**
- Design ChatMessage schema (userId, message, response, urgency, timestamp)
- Create chatbot endpoint structure (POST /api/chatbot/message)
- Store chat history in database
- Implement GET /api/chatbot/history

**AI/ML:**
- Research symptom analysis approaches (NLP/rule-based)
- Design symptom urgency classification system
- Create symptom analysis function
- Map symptoms to urgency levels (immediate, 24hrs, routine)

### Day 12
**Frontend:**
- Connect chatbot to backend API
- Implement real-time message sending
- Add urgency level display (color-coded badges)
- Polish chatbot UI/UX

**Backend + DB:**
- Complete chatbot endpoint integration
- Add validation for symptom descriptions
- Implement chat history retrieval
- Test chatbot flow

**AI/ML:**
- Complete symptom analysis algorithm
- Test with various symptom descriptions
- Refine urgency level classification
- Create response templates

### Day 13
**Frontend:**
- Integrate chatbot into report analysis page
- Add navigation between report upload and chatbot
- Polish all UI components
- Test responsive design

**Backend + DB:**
- Link chatbot with report analysis flow
- Add cross-feature data relationships
- Optimize database queries
- Add error handling improvements

**AI/ML:**
- Finalize symptom chatbot logic
- Test integration with frontend
- Document ML API endpoints
- Prepare for next phase

### Day 14
**All Roles:**
- Code review and merge Phase 2 features
- Integration testing
- Bug fixes
- Demo preparation for Phase 2

---

## 💳 Phase 3: Core Features II (Days 15-17)

### Day 15
**Frontend:**
- Design appointment booking page
- Create doctor selection component
- Implement calendar/date picker
- Add timeslot selection UI

**Backend + DB:**
- Design Timeslot schema (doctorId, date, startTime, endTime, isAvailable)
- Create timeslot management system
- Implement GET /api/appointments/timeslots/:doctorId
- Add timeslot booking logic

**AI/ML:**
- Continue refining ML models
- Prepare for WebRTC integration (if needed)
- Document ML API usage

### Day 16
**Frontend:**
- Complete appointment booking form
- Add form validation
- Connect booking to backend API
- Implement booking confirmation page

**Backend + DB:**
- Implement POST /api/appointments/book
- Add appointment conflict checking
- Update timeslot availability
- Send confirmation response

**AI/ML:**
- Test ML APIs with production-like data
- Optimize model inference speed
- Add logging for ML operations

### Day 17
**Frontend:**
- Design payment integration UI
- Add payment form component
- Integrate Razorpay SDK
- Create payment success/failure pages

**Backend + DB:**
- Setup payment gateway (Razorpay test mode)
- Design Payment schema (appointmentId, amount, status, transactionId)
- Implement payment initiation endpoint
- Create payment webhook handler

**AI/ML:**
- Continue model improvements
- Test chatbot edge cases
- Prepare ML documentation

---

> **🚨 Note: Project Pause (End of Day 17)**
> 
> Due to overwhelming college schedules (9:00 AM - 7:30 PM elite batch classes), nearly 2 hours of daily commute, and concurrent college fests, the progress halted at this point. 
> 
> **Status at Pause:**
> - **Frontend:** Completed up to Day 16 (Payment UI design is still pending).
> - **Backend & DB:** Completed up to Day 17.
> - **AI/ML:** Jupyter notebooks for Data Preprocessing, OCR, and multiple Disease Prediction models are completed, and `.pkl` model files are generated. However, Flask/FastAPI server setup, API endpoints, and the symptom chatbot are pending.

---

## 🏁 Phase 4: Project Wrap-Up### Day 18: Payments Integration & ML Verification
**Frontend:**
- Complete Day 17 backlog: Design payment integration UI
- Add payment form component (Razorpay SDK)
- Create payment success/failure pages

**Backend + DB:**
- Complete payment webhook implementation (catch-up/extend Day 17)
- Update appointment status after payment
- Implement GET /api/payments/history

**AI/ML:**
- Setup ML API project structure (Flask/FastAPI)
- Port model inference code from notebooks to Python scripts in `utils`
- Prepare environment and dependencies (requirements.txt)

### Day 19: Appointment Management
**Frontend:**
- Create appointment management page & cancellation feature
- Implement appointment rescheduling UI
- Add appointment status indicators

**Backend + DB:**
- Implement appointment cancellation (PUT /api/appointments/:id/cancel)
- Add rescheduling logic & update timeslot availability
- Implement refund logic (if applicable)

**AI/ML:**
- Create inference API endpoints for Disease Predictions (`/predict`)
- Write unit tests for the prediction endpoints locally
- Document API expected request/response formats

### Day 20: WebRTC Setup & Video UI
**Frontend:**
- Research/Setup WebRTC libraries (Simple-peer, Socket.io-client)
- Design video consultation page UI
- Create video call interface components

**Backend + DB:**
- Setup Socket.io server
- Design Consultation schema (appointmentId, roomId, startTime)
- Implement WebRTC signaling endpoints

**AI/ML:**
- Implement OCR API (`/extract-text`) integrating pytesseract/PyMuPDF
- Test OCR text extraction with sample medical reports
- Link OCR output parsing directly to disease models if required

### Day 21: WebRTC Integration Complete
**Frontend:**
- Implement WebRTC connection logic & peer handling
- Add basic call controls (mute, video toggle, end call)
- Test end-to-end video consultation

**Backend + DB:**
- Complete WebRTC signaling server
- Implement room creation/joining & presence tracking
- Add consultation history endpoints

**AI/ML:**
- Research and implement Symptom Chatbot logic (NLP or rule-based)
- Create Chatbot API endpoint (`/chatbot/message`)
- Map symptoms to urgency classification levels

### Day 22: UX Polish & Error Handling
**Frontend:**
- Polish booking, payment flows, and video UI
- Add universal loading skeletons and error states
- Fix minor UI/UX inconsistencies

**Backend + DB:**
- Add comprehensive error handling & input sanitization
- Implement application-wide logging system
- Security audit of endpoints

**AI/ML:**
- Coordinate with Backend/Frontend to integrate ML APIs
- Test end-to-end data flow (Upload -> OCR -> ML API -> Backend)
- Implement fallback/error responses for API timeouts and invalid inputs

### Day 23: Cross-Device & Load Testing
**Frontend:**
- Responsive design testing (mobile, tablet, desktop)
- Cross-browser compatibility checks
- Accessibility improvements

**Backend + DB:**
- Run API load testing
- Add necessary database indexing for fast queries
- Setup data backup and recovery routines

**AI/ML:**
- Add request logging and build ML monitoring basics
- Benchmark ML model performance and API response times under load
- Thoroughly test chatbot edge cases with varied symptom inputs

---

## 📋 Key Deliverables by Role

### Frontend Developer
- ✅ Complete React application with all pages
- ✅ Responsive UI/UX for all features
- ✅ Integration with all backend APIs
- ✅ WebRTC video consultation interface
- ✅ Payment gateway integration

### Backend + DB Developer
- ✅ RESTful API endpoints for all features
- ✅ MongoDB database with optimized schemas
- ✅ Authentication & authorization system
- ✅ Payment gateway integration
- ✅ WebRTC signaling server
- ✅ API documentation

### AI/ML Developer
- ✅ OCR text extraction API
- ✅ Disease prediction model & API
- ✅ Symptom chatbot with urgency classification
- ✅ ML API documentation
- ✅ Deployed ML services

---

## 🔄 Daily Standup Structure

**Time:** 15 minutes daily
**Agenda:**
1. What did you complete yesterday?
2. What are you working on today?
3. Any blockers or dependencies?

---

## 📝 Notes

- **Weekends:** Can be used for catch-up, bug fixes, or rest
- **Git Workflow:** Each feature in separate branch, PR required for merge
- **Testing:** Continuous testing throughout, not just at the end
- **Communication:** Daily standups, Slack/Teams for async communication
- **Flexibility:** Timeline can be adjusted based on team velocity

---

## 🚨 Risk Mitigation

- **Delays:** Buffer time built into weekends
- **Dependencies:** Backend APIs should be ready 1-2 days before frontend integration
- **ML Model Issues:** Have fallback rule-based approach for MVP
- **Payment Gateway:** Test mode setup early to avoid delays
- **WebRTC Complexity:** Start with basic implementation, enhance later

---

## 🚀 Deployment History

- **First Node.js Backend Deployment:** March 9, 2026 at 10:0:21 PM (Followed by various environment updates and redeployments)
- **First Vite Frontend Deployment:** March 11, 2026 at 05:41:43 PM
- **First ML-Service Deployment:** March 11, 2026 at 9:00 PM
- **First Chatbot Deployment:** March 12, 2026 at 5:30 PM

*Between initial deployments and March 15th, 2026, continuous redeployments were triggered to push the following critical environment fixes to production:*
- CORS configuration fixes
- Switching email service from Gmail SMTP to Resend
- Migrating file uploads from Multer to Cloudinary
- Switching Razorpay integration from Test mode to Live mode
