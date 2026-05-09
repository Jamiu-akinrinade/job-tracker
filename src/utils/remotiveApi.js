export async function searchRemoteJobs(query = "", category = "") {
  try {
    let url = `/api/remotive/api/remote-jobs?limit=20`

    if (category) {
      url += `&category=${encodeURIComponent(category)}`
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    // Filter results locally if query exists
    if (query.trim()) {
      return data.jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(query.toLowerCase()) ||
          job.company_name.toLowerCase().includes(query.toLowerCase()) ||
          job.tags?.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          )
      )
    }

    return data.jobs
  } catch (error) {
    console.error("Remotive fetch failed:", error)
    throw error
  }
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
]