import { useState } from "react"
import { useJobs } from "../../context/JobContext"
import { searchJobs } from "../../utils/adzunaApi"
import "./JobSearch.css"

const COUNTRIES = [
  { code: "gb", label: "UK" },
  { code: "us", label: "USA" },
  { code: "ca", label: "Canada" },
  { code: "au", label: "Australia" },
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
      if (err.message.includes("401")) {
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
      title: result.title,
      url: result.redirect_url,
      status: "applied",
    })
    setSaved((prev) => ({ ...prev, [result.id]: true }))
  }

  const isAlreadySaved = (result) => {
    return (
      saved[result.id] ||
      jobs.some(
        (j) =>
          j.company === result.company.display_name &&
          j.title === result.title
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
        <div className="job-search__input-wrap">
          <svg
            className="job-search__input-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.5 4.5" />
          </svg>
          <input
            type="text"
            placeholder="e.g. Frontend Developer"
            aria-label="Search jobs by keyword"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="job-search__input"
          />
        </div>

        <select
          value={country}
          aria-label="Choose a country"
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
          type="button"
          className="job-search__btn"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <p className="job-search__error" role="alert">
          {error}
        </p>
      )}

      {loading && (
        <div className="job-search__loading" role="status" aria-live="polite">
          <div className="job-search__spinner" aria-hidden="true" />
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
                  type="button"
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

      {!loading && results.length === 0 && !error && (
        <div className="job-search__empty" aria-live="polite">
          <div className="job-search__empty-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" focusable="false">
              <circle cx="27" cy="27" r="15" />
              <path d="m38 38 14 14" />
            </svg>
          </div>

          {query ? (
            <>
              <h3 className="job-search__empty-title">No jobs found</h3>
              <p className="job-search__empty-copy">
                Try a different role, country, or search term.
              </p>
            </>
          ) : (
            <>
              <h3 className="job-search__empty-title">Search for your next role</h3>
              <p className="job-search__empty-copy">
                Enter a role, location, or job type above to discover current
                opportunities.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default JobSearch
