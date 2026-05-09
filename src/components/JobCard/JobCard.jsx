import "./JobCard.css"

const STATUS_COLORS = {
  Applied: "#3b82f6",
  Interview: "#f59e0b",
  Offer: "#10b981",
  Rejected: "#ef4444",
}

function JobCard({ job, onDelete, onStatusChange }) {
  const statusOptions = ["Applied", "Interview", "Offer", "Rejected"]

  return (
    <div className="job-card">
      <div
        className="job-card__accent"
        style={{ backgroundColor: STATUS_COLORS[job.status] }}
      />

      <div className="job-card__body">
        <h3 className="job-card__role">{job.role}</h3>
        <p className="job-card__company">{job.company}</p>

        {job.link && (
          <a
            href={job.link}
            target="_blank"
            rel="noreferrer"
            className="job-card__link"
          >
            View Posting ↗
          </a>
        )}

        <p className="job-card__date">
          Added {new Date(job.dateAdded).toLocaleDateString()}
        </p>

        <select
          className="job-card__select"
          value={job.status}
          onChange={(e) => onStatusChange(job.id, e.target.value)}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
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