import { useJobs } from "../../context/JobContext";
import "./StatsBar.css";

function StatsBar() {
  const { jobs } = useJobs();

  const appliedJobs = jobs.filter((job) => job.status !== "wishlist").length;
  const interviews = jobs.filter(
    (job) => job.status === "interviewing"
  ).length;
  const offers = jobs.filter((job) => job.status === "offer").length;
  const rejected = jobs.filter((job) => job.status === "rejected").length;

  const stats = [
    {
      label: "Total Applied",
      value: appliedJobs,
      className: "stat-card--total",
    },
    {
      label: "Interviews",
      value: interviews,
      className: "stat-card--interviewing",
    },
    {
      label: "Offers",
      value: offers,
      className: "stat-card--offer",
    },
    {
      label: "Rejected",
      value: rejected,
      className: "stat-card--rejected",
    },
  ];

  return (
    <section className="statsbar" aria-label="Application summary">
      {stats.map((stat) => (
        <div key={stat.label} className={`statsbar__card ${stat.className}`}>
          <span className="statsbar__value">{stat.value}</span>
          <span className="statsbar__label">{stat.label}</span>
        </div>
      ))}
    </section>
  );
}

export default StatsBar;
