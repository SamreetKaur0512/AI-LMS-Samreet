# AI-LMS — AI-Based Learning Management System

**B.Tech Final Year Project | Samreet Kaur | Amritsar Group of Colleges**

An AI-powered Learning Management System with course management, quizzes, smart timetables, AI chat, recommendations, and Razorpay payment integration.

---

## Project Structure

```
AI-LMS-Samreet/
├── frontend/          ← React App (Create React App + Tailwind CSS)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── reducer/
│   │   ├── services/
│   │   ├── slices/
│   │   └── utils/
│   ├── .env               ← frontend env (REACT_APP_*)
│   ├── .env.example
│   └── package.json
│
├── backend/           ← Node.js + Express API Server
│   ├── ai_modules/        ← Python AI scripts
│   ├── config/
│   ├── controllers/
│   ├── mail/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   ├── .env               ← backend env (secrets)
│   ├── .env.example
│   └── package.json
│
├── images/            ← Architecture & schema diagrams
├── package.json       ← Root scripts (run both together)
└── README.md
```

---

## Quick Start (Local Development)

### 1. Install all dependencies
```bash
npm run install:all
```

### 2. Set up environment variables

**Frontend** — copy and edit `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```
```
REACT_APP_BASE_URL=http://localhost:4000/api/v1
REACT_APP_RAZORPAY_KEY=your_razorpay_key
```

**Backend** — copy and edit `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
Fill in your MongoDB URL, JWT secret, Cloudinary keys, Razorpay keys, Gmail credentials, and Gemini API key.

### 3. Run both together
```bash
npm run dev
```

Or separately:
```bash
# Terminal 1 — Frontend (http://localhost:3000)
npm run dev:frontend

# Terminal 2 — Backend (http://localhost:4000)
npm run dev:backend
```

---

## Deployment

### Backend → Render / Railway / Heroku

1. Push only the `backend/` folder (or set root directory to `backend/` in your platform settings).
2. Set all environment variables from `backend/.env.example` in your platform dashboard.
3. Add `FRONTEND_URL=https://your-frontend.vercel.app` to allow CORS from your deployed frontend.
4. Build command: *(none needed)*
5. Start command: `node index.js`

### Frontend → Vercel / Netlify

1. Push only the `frontend/` folder (or set root directory to `frontend/`).
2. Set environment variables:
   - `REACT_APP_BASE_URL=https://your-backend.onrender.com/api/v1`
   - `REACT_APP_RAZORPAY_KEY=your_razorpay_key`
3. Build command: `npm run build`
4. Output directory: `build`

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, Redux Toolkit, Tailwind CSS, Axios    |
| Backend   | Node.js, Express.js, MongoDB (Mongoose)         |
| Auth      | JWT, bcrypt, OTP via Nodemailer                 |
| Storage   | Cloudinary (images/videos)                      |
| Payments  | Razorpay                                        |
| AI        | Google Gemini API, custom Python ML modules     |
| Scheduler | node-cron, node-schedule                        |

---

## Features

- Student, Instructor, and Admin roles
- Course creation with sections, subsections, and video uploads
- Razorpay payment integration
- AI Chat assistant (Gemini API)
- Smart timetable generation
- Quiz system with scheduling
- AI course recommendations
- Early warning system for at-risk students
- Email notifications (OTP, enrollment, payment)
- Admin dashboard with analytics
