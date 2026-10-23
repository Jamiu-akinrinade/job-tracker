import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Job search is used inside the authenticated dashboard.
// Keeping it protected also reduces anonymous abuse of upstream APIs.
router.use(requireAuth);

const ALLOWED_COUNTRIES = new Set(["gb", "us", "ca", "au"]);
const MAX_PAGE = 50;
const MAX_RESULTS = 20;

function positiveInteger(value, fallback, maximum) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

function cleanQuery(value, maximumLength = 100) {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

function upstreamError(provider, response) {
  const error = new Error(`${provider} request failed with status ${response.status}`);
  error.status = 502;
  return error;
}

// GET /api/search/adzuna?query=frontend&country=gb&page=1
router.get("/adzuna", async (req, res, next) => {
  try {
    const query = cleanQuery(req.query.query);
    const country = cleanQuery(req.query.country, 2).toLowerCase() || "gb";
    const page = positiveInteger(req.query.page, 1, MAX_PAGE);

    if (!query) {
      return res.status(400).json({ error: "query is required" });
    }

    if (!ALLOWED_COUNTRIES.has(country)) {
      return res.status(400).json({
        error: "country must be one of: gb, us, ca, au",
      });
    }

    if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
      throw new Error("Adzuna credentials are not configured on the server");
    }

    const params = new URLSearchParams({
      app_id: process.env.ADZUNA_APP_ID,
      app_key: process.env.ADZUNA_APP_KEY,
      results_per_page: String(MAX_RESULTS),
      what: query,
      "content-type": "application/json",
    });

    const upstreamUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${params}`;
    const response = await fetch(upstreamUrl );

    if (!response.ok) {
      throw upstreamError("Adzuna", response);
    }

    const data = await response.json();
    return res.json({ results: Array.isArray(data.results) ? data.results : [] });
  } catch (error) {
    next(error);
  }
});

// GET /api/search/remotive?query=react&category=Software%20Development
router.get("/remotive", async (req, res, next) => {
  try {
    const query = cleanQuery(req.query.query);
    const category = cleanQuery(req.query.category, 80);

    const params = new URLSearchParams({ limit: String(MAX_RESULTS) });
    if (category) params.set("category", category);

    const upstreamUrl = `https://remotive.com/api/remote-jobs?${params}`;
    const response = await fetch(upstreamUrl );

    if (!response.ok) {
      throw upstreamError("Remotive", response);
    }

    const data = await response.json();
    let jobs = Array.isArray(data.jobs) ? data.jobs : [];

    // Preserve the current frontend behavior, but perform the optional
    // filtering on the server before returning data to the browser.
    if (query) {
      const normalizedQuery = query.toLowerCase();
      jobs = jobs.filter((job) => {
        const searchableText = [
          job.title,
          job.company_name,
          ...(Array.isArray(job.tags) ? job.tags : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      });
    }

    return res.json({ jobs });
  } catch (error) {
    next(error);
  }
});

export default router;