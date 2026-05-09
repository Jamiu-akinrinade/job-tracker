import { useState } from "react"
import { useJobs } from "../../context/JobContext"
import { searchRemoteJobs, REMOTIVE_CATEGORIES } from "../../utils/remotiveApi"
import "./RemoteJobs.css"

function RemoteJobs() {
  const { addJob, jobs } = useJobs()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState({})
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    setError("")
    setResults([])
    setSearched(true)

    try {
      const selectedCategory = category === "All" ? "" : category
      const data = await searchRemoteJobs(query, selectedCategory)
      setResults(data)
    } catch (err) {
      setError("Failed to fetch remote jobs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch()
  }

  const handleSave = (result) => {
    addJob({
      company: result.company_name,
      role: result.title,
      link: result.url,
      status: "Applied",
    })
    setSaved((prev) => ({ ...prev, [result.id]: true }))
  }

  const isAlreadySaved = (result) => {
    return (
      saved[result.id] ||
      jobs.some(
        (j) =>
          j.company === result.company_name &&
          j.role === result.title
      )
    )
  }

  return (
    <div className="remote-jobs">
      <div className="remote-jobs__header">
        <h2 className="remote-jobs__title">Remote Jobs</h2>
        <p className="remote-jobs__subtitle">
          Find remote roles worldwide — apply from anywhere including Nigeria 🌍
        </p>
      </div>

      <div className="remote-jobs__bar">
        <input
          type="text"
          placeholder="e.g. React Developer, UI Designer..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="remote-jobs__input"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="remote-jobs__select"
        >
          {REMOTIVE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat === "All" ? "" : cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          className="remote-jobs__btn"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="remote-jobs__error">{error}</p>}

      {loading && (
        <div className="remote-jobs__loading">
          <div className="remote-jobs__spinner" />
          <p>Fetching remote jobs...</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="remote-jobs__results">
          <p className="remote-jobs__count">
            {results.length} remote jobs found
          </p>
          {results.map((result) => (
            <div key={result.id} className="remote-jobs__card">
              <div className="remote-jobs__card-left">
                {result.company_logo && (
                  <img
                    src={result.company_logo}
                    alt={result.company_name}
                    className="remote-jobs__logo"
                  />
                )}
              </div>

              <div className="remote-jobs__card-body">
                <h3 className="remote-jobs__role">{result.title}</h3>
                <p className="remote-jobs__company">{result.company_name}</p>

                <div className="remote-jobs__tags">
                  <span className="remote-jobs__tag remote-jobs__tag--green">
                    🌍 Remote
                  </span>
                  {result.candidate_required_location && (
                    <span className="remote-jobs__tag">
                      📍 {result.candidate_required_location}
                    </span>
                  )}
                  {result.salary && (
                    <span className="remote-jobs__tag">
                      💰 {result.salary}
                    </span>
                  )}
                  <span className="remote-jobs__tag">
                    🗂 {result.category}
                  </span>
                </div>
              </div>

              <div className="remote-jobs__card-actions">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  className="remote-jobs__link"
                >
                  View Job ↗
                </a>
                <button
                  className={`remote-jobs__save ${
                    isAlreadySaved(result)
                      ? "remote-jobs__save--saved"
                      : ""
                  }`}
                  onClick={() => handleSave(result)}
                  disabled={isAlreadySaved(result)}
                >
                  {isAlreadySaved(result) ? "✓ Saved" : "+ Save"}
                </button>
              </div>
            </div>
          ))}       
        </div>
      )}

      {!loading && searched && results.length === 0 && !error && (
        <div className="remote-jobs__empty">
          <p>No remote jobs found.</p>
          <p>Try a broader search term or different category.</p>
        </div>
      )}

      {!searched && !loading && (
        <div className="remote-jobs__prompt">
          <p>🔍 Search above or just hit <strong>Search</strong> to browse all remote jobs</p>
        </div>
      )}
    </div>
  )
}

export default RemoteJobs