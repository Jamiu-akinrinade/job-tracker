console.log("ID:", import.meta.env.VITE_ADZUNA_APP_ID)
console.log("Key:", import.meta.env.VITE_ADZUNA_APP_KEY)

const APP_ID = import.meta.env.VITE_ADZUNA_APP_ID
const APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY

export async function searchJobs(query, country = "gb", page = 1) {
  try {
    const url = `/api/adzuna/v1/api/jobs/${country}/search/${page}?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=10&what=${encodeURIComponent(query)}&content-type=application/json`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.results
  } catch (error) {
    console.error("Adzuna fetch failed:", error)
    throw error
  }
}