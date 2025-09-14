Airbnb clone (homepage only)

Structure:
- frontend/ (Next.js + TypeScript)
- backend/ (Express + TypeScript + MongoDB)

Backend:
- Run `npm install` then `npm run dev` in backend to start server on port 4000.
- Provide MONGO_URI env var to connect to MongoDB.

Frontend:
- Run `npm install` then `npm run dev` in frontend to start Next.js on port 3000.
- Frontend fetches listings from backend /api/listings and supports filters: location, checkIn, checkOut, guests.
- Language can be switched between English and Bangla via dropdown; translations fetched from /api/translations/:locale

Notes:
- Only the homepage is implemented with responsive layout and filter controls.
- Seed data created on backend if DB empty.
