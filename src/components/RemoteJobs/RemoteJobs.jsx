import { useState } from "react"
import {
  BsArrowUpRight,
  BsBookmark,
  BsBookmarkCheckFill,
  BsBriefcase,
  BsCashStack,
  BsGeoAlt,
  BsGlobe2,
  BsSearch,
} from "react-icons/bs"
import { useJobs } from "../../context/JobContext"
import { searchRemoteJobs, REMOTIVE_CATEGORIES } from "../../utils/remotiveApi"
import "./RemoteJobs.css"

const POPULAR_SEARCHES = [
  "Frontend",
  "Backend",
  "Full-stack",
  "Designer",
  "DevOps",
  "Product",
]

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

  const handlePopularSearch = (searchTerm) => {
    setQuery(searchTerm)
  }

  const handleSave = (result) => {
    addJob({
      company: result.company_name,
      title: result.title,
      url: result.url,
      status: "applied",
    })
    setSaved((prev) => ({ ...prev, [result.id]: true }))
  }

  const isAlreadySaved = (result) => {
    return (
      saved[result.id] ||
      jobs.some(
        (j) =>
          j.company === result.company_name &&
          j.title === result.title
      )
    )
  }

  return (
    <div className="remote-jobs">
      <div className="remote-jobs__header">
        <p className="remote-jobs__eyebrow">
          <BsGlobe2 aria-hidden="true" /> Worldwide opportunities
        </p>
        <h2 className="remote-jobs__title">Remote Jobs</h2>
        <p className="remote-jobs__subtitle">
          Find remote roles worldwide — apply from anywhere including Nigeria
        </p>
      </div>

      <div className="remote-jobs__bar">
        <div className="remote-jobs__input-wrap">
          <BsSearch className="remote-jobs__input-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search remote jobs..."
            aria-label="Search remote jobs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="remote-jobs__input"
          />
        </div>

        <select
          value={category}
          aria-label="Choose a remote job category"
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
          type="button"
          className="remote-jobs__btn"
          onClick={handleSearch}
          disabled={loading}
        >
          <BsSearch aria-hidden="true" />
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="remote-jobs__popular" aria-label="Popular remote searches">
        <div className="remote-jobs__popular-heading">Popular searches</div>
        <div className="remote-jobs__chips">
          {POPULAR_SEARCHES.map((searchTerm) => (
            <button
              key={searchTerm}
              type="button"
              className="remote-jobs__chip"
              onClick={() => handlePopularSearch(searchTerm)}
            >
              {searchTerm}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="remote-jobs__error" role="alert">
          {error}
        </p>
      )}

      {loading && (
        <div className="remote-jobs__loading" role="status" aria-live="polite">
          <div className="remote-jobs__spinner" aria-hidden="true" />
          <p>Fetching remote jobs...</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="remote-jobs__results">
          <div className="remote-jobs__results-heading">
            <p className="remote-jobs__count">
              {results.length} remote {results.length === 1 ? "job" : "jobs"} found
            </p>
            <span className="remote-jobs__results-label">Remotive listings</span>
          </div>

          {results.map((result) => (
            <article key={result.id} className="remote-jobs__card">
              <div className="remote-jobs__card-top">
                <div className="remote-jobs__card-left">
                  {result.company_logo ? (
                    <img
                      src={result.company_logo}
                      alt={`${result.company_name} logo`}
                      className="remote-jobs__logo"
                    />
                  ) : (
                    <div className="remote-jobs__logo-fallback" aria-hidden="true">
                      <BsBriefcase />
                    </div>
                  )}
                </div>

                <div className="remote-jobs__card-body">
                  <h3 className="remote-jobs__role">{result.title}</h3>
                  <p className="remote-jobs__company">{result.company_name}</p>
                </div>

                <BsBookmark className="remote-jobs__bookmark" aria-hidden="true" />
              </div>

              <div className="remote-jobs__tags">
                <span className="remote-jobs__tag remote-jobs__tag--green">
                  <BsGlobe2 aria-hidden="true" /> Remote
                </span>
                {result.candidate_required_location && (
                  <span className="remote-jobs__tag">
                    <BsGeoAlt aria-hidden="true" /> {result.candidate_required_location}
                  </span>
                )}
                {result.salary && (
                  <span className="remote-jobs__tag">
                    <BsCashStack aria-hidden="true" /> {result.salary}
                  </span>
                )}
                {result.job_type && (
                  <span className="remote-jobs__tag">
                    <BsBriefcase aria-hidden="true" /> {result.job_type}
                  </span>
                )}
                {result.category && (
                  <span className="remote-jobs__tag">
                    {result.category}
                  </span>
                )}
              </div>

              <div className="remote-jobs__card-actions">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  className="remote-jobs__link"
                >
                  View Job <BsArrowUpRight aria-hidden="true" />
                </a>
                <button
                  type="button"
                  className={`remote-jobs__save ${
                    isAlreadySaved(result) ? "remote-jobs__save--saved" : ""
                  }`}
                  onClick={() => handleSave(result)}
                  disabled={isAlreadySaved(result)}
                >
                  {isAlreadySaved(result) ? (
                    <>
                      <BsBookmarkCheckFill aria-hidden="true" /> Saved
                    </>
                  ) : (
                    <>
                      <BsBookmark aria-hidden="true" /> Save
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && !error && (
        <div className="remote-jobs__empty" role="status">
          <BsGlobe2 className="remote-jobs__empty-icon" aria-hidden="true" />
          <h3>No remote jobs found</h3>
          <p>Try a broader search term or choose a different category.</p>
        </div>
      )}

      {!searched && !loading && (
        <div className="remote-jobs__prompt">
          <BsGlobe2 className="remote-jobs__prompt-icon" aria-hidden="true" />
          <h3>Find work without borders</h3>
          <p>Search above or choose a popular search to explore remote opportunities.</p>
        </div>
      )}
    </div>
  )
}

export default RemoteJobs
