import JobCard from "../JobCard/JobCard"
import "./KanbanColumn.css"

const STATUS_COLORS = {
  Applied: "#3b82f6",
  Interview: "#f59e0b",
  Offer: "#10b981",
  Rejected: "#ef4444",
}

function KanbanColumn({ status, jobs, onDelete, onStatusChange }) {
  return (
    <div className="kanban-column">
      <div className="kanban-column__header">
        <span
          className="kanban-column__dot"
          style={{ backgroundColor: STATUS_COLORS[status] }}
        />
        <h2 className="kanban-column__title">{status}</h2>
        <span className="kanban-column__count">{jobs.length}</span>
      </div>

      <div className="kanban-column__cards">
        {jobs.length === 0 ? (
          <p className="kanban-column__empty">No jobs here yet</p>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default KanbanColumn