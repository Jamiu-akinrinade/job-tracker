import JobCard from "../JobCard/JobCard"
import "./KanbanColumn.css"

const STATUS_COLORS = {
  wishlist: "#9ca3af",
  applied: "#3b82f6",
  interviewing: "#f59e0b",
  offer: "#10b981",
  rejected: "#ef4444",
  accepted: "#8b5cf6",
}

const STATUS_CAPTIONS = {
  wishlist: "Roles you may apply to",
  applied: "Waiting for a response",
  interviewing: "Prepare for your next step",
  offer: "Offers on the table",
  rejected: "Keep the momentum going",
  accepted: "Your next chapter",
}



function KanbanColumn({ status, jobs, onDelete, onStatusChange }) {
  return (
    <div className="kanban-column">
        <div className="kanban-column__header">
          <span
            className="kanban-column__dot"
            style={{ backgroundColor: STATUS_COLORS[status] }}
          />

          <div className="kanban-column__heading">
            <h2 className="kanban-column__title">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </h2>
            <p className="kanban-column__caption">
              {STATUS_CAPTIONS[status]}
            </p>
          </div>

          <span className="kanban-column__count">{jobs.length}</span>
        </div>


      <div className="kanban-column__cards">
        {jobs.length === 0 ? (
          <p className="kanban-column__empty">Add an application here</p>
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