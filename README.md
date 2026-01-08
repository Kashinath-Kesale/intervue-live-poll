# Resilient Real-Time Live Polling System

The system supports two roles — **Teacher** and **Student** — and ensures real-time updates, state recovery, and data integrity using Socket.io and a persistent database.

---

## 🚀 Features

### Teacher
- Create live polls with configurable time limits
- View live vote aggregation in real time
- Poll automatically ends when time expires
- View final results and poll history

### Student
- Join polls in real time
- Server-synchronized countdown timer
- Vote once per poll (duplicate voting prevented)
- View live results and final results
- State recovery on refresh

---

## 🛡️ Resilience & Data Integrity

- Server is the single source of truth for:
  - Poll state
  - Timer
  - Vote counts
- Poll state survives page refresh
- Late-joining students see correct remaining time
- Database-level unique constraints prevent duplicate votes

---

## 🧑‍💻 Tech Stack

**Frontend**
- React.js (Hooks)
- Vite
- Socket.io Client

**Backend**
- Node.js
- Express.js
- Socket.io
- MongoDB

**Deployment**
- Backend: Render
- Frontend: Vercel

---

## 🌐 Live Links

- **Frontend**: https://intervue-live-poll-puce.vercel.app  
- **Backend Health Check**: https://live-polling-n3w8.onrender.com/health  

---

## 🏗️ Architecture Overview

- Controller–Service pattern on backend
- No business logic inside routes or socket handlers
- Custom React hooks (`useSocket`, `useActivePoll`, `usePollTimer`)
- Event-driven real-time updates using Socket.io

---

## 📦 Setup (Local)

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
