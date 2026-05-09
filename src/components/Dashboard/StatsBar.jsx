import { useJobs } from "../../context/JobContext"
import "./StatsBar.css"

function StatsBar() {
  const { jobs } = useJobs()

  const stats = [
    {
      label: "Total Applied",
      value: jobs.length,
      color: "#6366f1",
      bg: "#eef2ff",
    },
    {
      label: "Interviews",
      value: jobs.filter((j) => j.status === "Interview").length,
      color: "#f59e0b",
      bg: "#fffbeb",
    },
    {
      label: "Offers",
      value: jobs.filter((j) => j.status === "Offer").length,
      color: "#10b981",
      bg: "#ecfdf5",
    },
    {
      label: "Rejected",
      value: jobs.filter((j) => j.status === "Rejected").length,
      color: "#ef4444",
      bg: "#fef2f2",
    },
  ]

  return (
    <div className="statsbar">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="statsbar__card"
          style={{ backgroundColor: stat.bg }}
        >
          <span
            className="statsbar__value"
            style={{ color: stat.color }}
          >
            {stat.value}
          </span>
          <span className="statsbar__label">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}

export default StatsBar