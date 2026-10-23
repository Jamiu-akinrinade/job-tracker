import { useJobs } from "../../context/JobContext"
import KanbanColumn from "./KanbanColumn"
import JobCard from "../JobCard/JobCard"
import "./KanbanBoard.css"


// 1. Added 'wishlist' and fixed 'interviewing' to match DB exactly
const STATUSES = ["wishlist", "applied", "interviewing", "offer", "rejected", "accepted"]

function KanbanBoard({ filteredJobs, isSearching = false }) {

  const { deleteJob, updateJob } = useJobs()

  const handleStatusChange = (id, newStatus) => {
    updateJob(id, { status: newStatus })
  }

    
      if (isSearching) {
    return (
      <div className="kanban-search-results">
        {filteredJobs.length === 0 ? (
          <p className="kanban-search-results__empty" role="status">
            No applications match your search.
          </p>
        ) : (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onDelete={deleteJob}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    )
  }



  return (
    <div className="kanban-board">
      {STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          // 2. Added .toLowerCase() to make the filter bulletproof
          jobs={filteredJobs.filter((job) => job.status.toLowerCase() === status.toLowerCase())}
          onDelete={deleteJob}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  )
}

export default KanbanBoard
