import { useState } from "react"
import { useJobs } from "../../context/JobContext"
import { searchJobs } from "../../utils/adzunaApi"
import "./JobSearch.css"

const COUNTRIES = [
  { code: "gb", label: "UK" },
  { code: "us", label: "USA" },
  { code: "ca", label: "Canada" },
  { code: "au", label: "Australia" },
  { code: "ng", label: "Nigeria" },
]

function JobSearch() {
  const { addJob, jobs } = useJobs()
  const [query, setQuery] = useState("")
  const [country, setCountry] = useState("gb")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState({})

  const handleSearch = async () => {
  if (!query.trim()) return
  setLoading(true)
  setError("")
  setResults([])

  try {
    const data = await searchJobs(query, country)
    setResults(data)
  } catch (err) {
    if (country === "ng") {
      setError("Adzuna doesn't support Nigerian listings yet. Try the Remote Jobs tab for worldwide remote roles you can apply to from Nigeria 🌍")
    } else if (err.message.includes("401")) {
      setError("Authentication error. Please try again later.")
    } else if (err.message.includes("404")) {
      setError("No results found for that search. Try a different term or country.")
    } else {
      setError("Something went wrong. Please check your connection and try again.")
    }
  } finally {
    setLoading(false)
  }
}

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch()
  }

  const handleSave = (result) => {
    addJob({
      company: result.company.display_name,
      role: result.title,
      link: result.redirect_url,
      status: "Applied",
    })
    setSaved((prev) => ({ ...prev, [result.id]: true }))
  }

  const isAlreadySaved = (result) => {
    return (
      saved[result.id] ||
      jobs.some(
        (j) =>
          j.company === result.company.display_name &&
          j.role === result.title
      )
    )
  }

  return (
    <div className="job-search">
      <div className="job-search__header">
        <h2 className="job-search__title">Find Jobs</h2>
        <p className="job-search__subtitle">
          Search live listings and save them straight to your tracker
        </p>
      </div>

      <div className="job-search__bar">
        <input
          type="text"
          placeholder="e.g. Frontend Developer"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="job-search__input"
        />

        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="job-search__select"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>

        <button
          className="job-search__btn"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="job-search__error">{error}</p>}

      {loading && (
        <div className="job-search__loading">
          <div className="job-search__spinner" />
          <p>Fetching live jobs...</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="job-search__results">
          {results.map((result) => (
            <div key={result.id} className="job-search__card">
              <div className="job-search__card-body">
                <h3 className="job-search__role">{result.title}</h3>
                <p className="job-search__company">
                  {result.company.display_name}
                </p>
                <p className="job-search__location">
                  📍 {result.location.display_name}
                </p>
                {result.salary_min && (
                  <p className="job-search__salary">
                    💰 £{Math.round(result.salary_min).toLocaleString()} —
                    £{Math.round(result.salary_max).toLocaleString()}
                  </p>
                )}
                <p className="job-search__description">
                  {result.description.slice(0, 150)}...
                </p>
              </div>

              <div className="job-search__card-actions">
                <a
                  href={result.redirect_url}
                  target="_blank"
                  rel="noreferrer"
                  className="job-search__link"
                >
                  View Job ↗
                </a>
                <button
                  className={`job-search__save ${
                    isAlreadySaved(result) ? "job-search__save--saved" : ""
                  }`}
                  onClick={() => handleSave(result)}
                  disabled={isAlreadySaved(result)}
                >
                  {isAlreadySaved(result) ? "✓ Saved" : "+ Save to Tracker"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && !error && (
        <p className="job-search__empty">
          No results found. Try a different search term.
        </p>
      )}
    </div>      
  )
}

export default JobSearch