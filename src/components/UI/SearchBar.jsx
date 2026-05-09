import "./SearchBar.css"

function SearchBar({ search, onSearch, filter, onFilter }) {
  const statuses = ["All", "Applied", "Interview", "Offer", "Rejected"]

  return (
    <div className="searchbar">
      <input
        type="text"
        className="searchbar__input"
        placeholder="Search by company or role..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />

      <div className="searchbar__filters">
        {statuses.map((s) => (
          <button
            key={s}
            className={`searchbar__pill ${filter === s ? "searchbar__pill--active" : ""}`}
            onClick={() => onFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SearchBar