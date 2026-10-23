import "./JobCard.css"

const STATUS_COLORS = {
  applied: "#3b82f6",
  interviewing: "#f59e0b",
  offer: "#10b981",
  rejected: "#ef4444",
  wishlist: "#6b7280",
  accepted: "#8b5cf6",
}

function JobCard({ job, onDelete, onStatusChange }) {
  const statusOptions = ["wishlist", "applied", "interviewing", "offer", "rejected", "accepted"]

  return (
    <div className="job-card">
      <div
        className="job-card__accent"
        style={{ backgroundColor: STATUS_COLORS[job.status] }}
      />

      <div className="job-card__body">
        {/* 1. Changed job.role to job.title */}
        <h3 className="job-card__role">{job.title}</h3>
        <p className="job-card__company">{job.company}</p>

        {/* 2. Changed job.link to job.url */}
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="job-card__link"
          >
            View Posting ↗
          </a>
        )}

        {/* 3. Changed job.dateAdded to job.created_at */}
        <p className="job-card__date">
          Added {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
        </p>

        <select
          className="job-card__select"
          value={job.status}
          onChange={(e) => onStatusChange(job.id, e.target.value)}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {/* This makes the dropdown look pretty (e.g., 'Applied') while keeping the value lowercase */}
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <button
        className="job-card__delete"
        onClick={() => onDelete(job.id)}
        aria-label="Delete job"
      >
        ✕
      </button>
    </div>
  )
}

export default JobCard
