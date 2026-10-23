
import { BsSearch } from "react-icons/bs"


import "./SearchBar.css"

function SearchBar({ search, onSearch, filter, onFilter }) {
  // 1. Added 'wishlist' and fixed 'interviewing' to match your PostgreSQL CHECK constraint
  const statuses = ["All", "wishlist", "applied", "interviewing", "offer", "rejected", "accepted"]

  return (
        <div className="searchbar">
            <div className="searchbar__input-wrap">
          <BsSearch className="searchbar__input-icon" aria-hidden="true" />
          <input
            type="text"
            className="searchbar__input"
            placeholder="Search by company or title..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>


      <div className="searchbar__filters">
        {statuses.map((s) => (
          <button
            key={s}
            className={`searchbar__pill ${filter.toLowerCase() === s.toLowerCase() ? "searchbar__pill--active" : ""}`}
            onClick={() => onFilter(s)}
          >
            {/* This makes 'wishlist' look like 'Wishlist' on the button */}
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SearchBar
