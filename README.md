# Job Tracker

A full-featured job application tracker built with React. Track your applications 
on a Kanban board, search live job listings, and find remote roles worldwide.

🔗 Live Demo: https://job-tracker-phi-fawn.vercel.app

## Features

- Kanban board with four stages — Applied, Interview, Offer, Rejected
- Stats dashboard showing real-time application counts
- Search and filter jobs by company, role, or status
- Live job search powered by Adzuna API
- Remote jobs search powered by Remotive API (no location restriction)
- LocalStorage persistence — data survives page refreshes
- Responsive design for mobile and desktop

## Tech Stack

- React 18 (Vite)
- React Context API for global state management
- Custom useLocalStorage hook for persistence
- Adzuna REST API for live job listings
- Remotive REST API for remote jobs
- Plain CSS with BEM naming convention
- Deployed on Vercel

## Getting Started

1. Clone the repo
   git clone https://github.com/YOUR_USERNAME/job-tracker.git

2. Install dependencies
   npm install

3. Create a .env file in the root
   VITE_ADZUNA_APP_ID=your_app_id
   VITE_ADZUNA_APP_KEY=your_app_key

4. Start the dev server
   npm run dev

## Architecture Decisions

- Context API over Redux — app complexity doesn't justify Redux overhead
- localStorage over a backend — keeps the app frontend-only and instantly deployable
- Vite proxy in dev, Vercel rewrites in production — handles CORS without exposing keys
