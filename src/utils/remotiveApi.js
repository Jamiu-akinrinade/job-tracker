import { API_BASE_URL, getAuthHeaders } from "./api";

export async function searchRemoteJobs(query = "", category = "") {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("query", query.trim());
  }

  if (category) {
    params.set("category", category);
  }

  const response = await fetch(`${API_BASE_URL}/search/remotive?${params}`, {
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

  return Array.isArray(data.jobs) ? data.jobs : [];
}

export const REMOTIVE_CATEGORIES = [
  "All",
  "Software Development",
  "Design",
  "Marketing",
  "Customer Service",
  "Data",
  "DevOps / Sysadmin",
  "Product",
  "Sales",
  "Writing",
  "QA",
  "Finance",
];