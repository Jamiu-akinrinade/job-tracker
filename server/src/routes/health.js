// routes/health.js
// The very first route — intentionally trivial.
// WHY a health route at all?
// 1. It proves the server is running and reachable *before* you add real logic.
// 2. Deployment platforms (Render, Fly.io, etc.) call a health endpoint to
//    know your server is alive. Having one from day one costs nothing.
// 3. It doubles as a free "database smoke test" once we ping the DB here.
import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

// GET /api/health
router.get("/", async (_req, res) => {
  try {
    // Verify the database too — if the DB is down, "status: ok" is a lie.
    const { rows } = await pool.query("SELECT NOW() AS db_time");
    res.json({
      status: "ok",
      service: "job-tracker-api",
      db: "connected",
      dbTime: rows[0].db_time.toISOString(),
    });
  } catch (err) {
    // 503 = "service unavailable". React will read this in the Network tab
    // and you'll know immediately the problem is the DB layer, not the route.
    res.status(503).json({
      status: "error",
      service: "job-tracker-api",
      db: "unreachable",
      message: err.message,
    });
  }
});

export default router;
