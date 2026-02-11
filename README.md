# Smart Education Platform

A full-stack learning platform with role-based dashboards (admin, teacher, student), AI-powered doubt resolution, chat assistance, and gamified progress tracking. The app supports course materials, revisions, knowledge maps, and offline-friendly student features.

## Features

- Role-based access (admin/teacher/student)
- Course and topic management
- Student progress tracking and knowledge map
- AI doubt resolution with RAG over uploaded materials
- Smart chatbot with Gemini fallback models
- Gamification: XP, badges, streaks, leaderboard
- PDF and text material ingestion with embeddings
- Offline indicator and downloads for students

## Tech Stack

- Frontend: React, React Router, Tailwind CSS
- Backend: Node.js, Express, MongoDB (Mongoose)
- AI: Google Gemini (generation + embeddings)
- Hosting: Vercel (serverless + static build)

## Project Structure

- backend/: API server, controllers, models, routes, services
- frontend/: React app
- vercel.json: Vercel build + rewrite rules

## Prerequisites

- Node.js 24.x
- MongoDB instance (local or cloud)
- Google Gemini API key

## Environment Variables

Create a .env file in backend/ with:

- MONGODB_URI=your_mongo_connection_string
- MONGODB_URI_DIRECT=your_direct_connection_string_optional
- JWT_SECRET=your_jwt_secret
- GEMINI_API_KEY=your_gemini_api_key
- PORT=5000_optional

Optional frontend environment variable (only if you want a custom API URL):

- REACT_APP_API_URL=http://localhost:5000/api

## Install and Run (Local Development)

### Backend

1. Install dependencies:
   - cd backend
   - npm install
2. Start the API:
   - npm run dev

Server runs on http://localhost:5000 by default.

### Frontend

1. Install dependencies:
   - cd frontend
   - npm install
2. Start the web app:
   - npm start

Frontend runs on http://localhost:3000 and proxies /api to the backend.

## Seed Sample Data

This project includes a comprehensive seed script.

- cd backend
- npm run seed

Default accounts created by the seed script:

- Admin: admin@education.com / admin123
- Teacher: teacher@education.com / teacher123
- Student: student@education.com / student123

## API Overview

Base URL: /api

- /auth: login, me, logout
- /users: admin user management
- /materials: upload, list, and read materials (PDF/text)
- /doubts: submit doubts and AI answers
- /courses: courses and topics
- /progress: student progress and knowledge map
- /revisions: revision scheduling and completion
- /gamification: profile, leaderboard, badges
- /chat: student chat assistant
- /ai: mock AI endpoints for future models

## Deployment (Vercel)

The repository includes vercel.json with:

- backend/serverless.js deployed as serverless API
- frontend built as a static app
- rewrites for /api and frontend assets

## Notes

- AI features require GEMINI_API_KEY. Without it, some endpoints will fail or fall back.
- Materials are embedded asynchronously after upload.

## Scripts

Backend (backend/package.json):

- npm run dev
- npm run start
- npm run seed

Frontend (frontend/package.json):

- npm start
- npm run build
- npm test
