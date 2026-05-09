import { useState } from "react"
import { useJobs } from "./context/JobContext"
import KanbanBoard from "./components/Board/KanbanBoard"
import AddJobModal from "./components/AddJobModal/AddJobModal"
import StatsBar from "./components/Dashboard/StatsBar"
import SearchBar from "./components/UI/SearchBar"
import JobSearch from "./components/JobSearch/JobSearch"
import RemoteJobs from "./components/RemoteJobs/RemoteJobs"
import "./index.css"

function App() {
  const { jobs } = useJobs()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")
  const [activeTab, setActiveTab] = useState("tracker")

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.role.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "All" || job.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Job Tracker</h1>
        {activeTab === "tracker" && (
          <button
            className="app__add-btn"
            onClick={() => setShowModal(true)}
          >
            + Add Job
          </button>
        )}
      </header>

      <div className="app__tabs">
        <button
          className={`app__tab ${activeTab === "tracker" ? "app__tab--active" : ""}`}
          onClick={() => setActiveTab("tracker")}
        >
          My Tracker
        </button>
        <button
          className={`app__tab ${activeTab === "search" ? "app__tab--active" : ""}`}
          onClick={() => setActiveTab("search")}
        >
          Find Jobs
        </button>
        <button
          className={`app__tab ${activeTab === "remote" ? "app__tab--active" : ""}`}
          onClick={() => setActiveTab("remote")}
        >
          Remote Jobs 🌍
        </button>
      </div>

      <main>
        {activeTab === "tracker" && (
          <>
            <StatsBar />
            <SearchBar
              search={search}
              onSearch={setSearch}
              filter={filter}
              onFilter={setFilter}
            />
            <KanbanBoard filteredJobs={filteredJobs} />
          </>
        )}
        {activeTab === "search" && <JobSearch />}
        {activeTab === "remote" && <RemoteJobs />}
      </main>

      {showModal && (
        <AddJobModal onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}

export default App