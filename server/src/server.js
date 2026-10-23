// server.js — the entry point. `npm run dev` (nodemon) starts here.
//
// WHY this shape?
// - `import "dotenv/config"` must run before anything that reads process.env.
// - CORS is configured for your React dev server's origin *only*, so the API
//   can't be called from any random website. (React runs on 5173 by default
//   with Vite; 3000 if you use plain CRA.)
// - The health route is mounted at /api/health so every future route lives
//   under /api — a common convention that keeps the API surface obvious.
import "dotenv/config";
import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import authRoutes from "./routes/auth.js";

import jobsRouter from "./routes/jobs.js";
import { checkDatabase } from "./db/pool.js";
import searchRouter from "./routes/search.js";

const app = express();
const PORT = process.env.PORT || 4000;


// const PORT = process.env.PORT || 4000;
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server running on http://0.0.0.0:${PORT}` );
// });


// ---------- Global middleware ----------
// Allow requests ONLY from your React dev server. Add your production URL
// here later (e.g. ["http://localhost:5173", "https://myapp.onrender.com"]).
// app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://192.168.0.2:5173",
    ],
  } )
);

// Parse JSON request bodies. Without this, req.body is always undefined.
app.use(express.json());


// ---------- Routes ----------
app.use("/api/health", healthRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRouter);


// A placeholder so the React dev server root isn't confused. We never serve
// HTML from Express (EJS was skipped by design — React owns the UI).
app.get("/", (_req, res) => {
  res.json({
    message: "job-tracker API is running. Try GET /api/health",
  });
});

// ---------- Error handling ----------
// One centralized error handler. Any route that calls next(err) — or throws
// an async error Express catches — lands here. This keeps every route clean:
// they just forward errors with next(err) instead of duplicating try/catch
// JSON error responses everywhere.
app.use((err, _req, res, _next) => {
  console.error("❌", err.message);
  // 500 = "something broke on our side". Never leak stack traces to the
  // client — they help attackers; your terminal log is where they belong.
  res.status(500).json({ error: "Internal server error" });
});

// ---------- Start ----------
// Start the HTTP server first, THEN check the database.
// WHY? If we connected to the DB first and it was down, the app would never
// start and you couldn't even test the health route. Server up + "db:
// unreachable" on the health route is far easier to debug.

app.listen(PORT, "0.0.0.0", () => {

  

// app.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
  console.log(`   Local API:       http://localhost:${PORT}` );
  console.log(`   Network API:     http://192.168.0.2:${PORT}` );
  console.log(`   Health check:    http://localhost:${PORT}/api/health`);
  checkDatabase().catch((err) => {
    console.error("❌ Database check failed:", err.message);
  });
});
