import { useJobs } from "../../context/JobContext"
import KanbanColumn from "./KanbanColumn"
import "./KanbanBoard.css"

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"]

function KanbanBoard({ filteredJobs }) {
  const { deleteJob, updateJob } = useJobs()

  const handleStatusChange = (id, newStatus) => {
    updateJob(id, { status: newStatus })
  }

  return (
    <div className="kanban-board">
      {STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          jobs={filteredJobs.filter((job) => job.status === status)}
          onDelete={deleteJob}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  )
}

export default KanbanBoard