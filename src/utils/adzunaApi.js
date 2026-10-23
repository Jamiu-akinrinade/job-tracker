import { API_BASE_URL, getAuthHeaders } from "./api";

export async function searchJobs(query, country = "gb", page = 1) {
  const params = new URLSearchParams({
    query: query.trim(),
    country,
    page: String(page),
  });

  const response = await fetch(`${API_BASE_URL}/search/adzuna?${params}`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.error || data.message || `API error: ${response.status}`
    );
    error.status = response.status;
    throw error;
  }

  return Array.isArray(data.results) ? data.results : [];
}
