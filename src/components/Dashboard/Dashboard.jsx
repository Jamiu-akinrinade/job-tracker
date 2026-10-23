import { useState } from "react";
import { useJobs } from "../../context/JobContext";
import KanbanBoard from "../Board/KanbanBoard";
import AddJobModal from "../AddJobModal/AddJobModal";
import StatsBar from "./StatsBar";
import "./welcome.css";
import SearchBar from "../UI/SearchBar";
import JobSearch from "../JobSearch/JobSearch";
import RemoteJobs from "../RemoteJobs/RemoteJobs";
import {
  BsBoxArrowRight,
  BsGlobe2,
  BsGridFill,
  BsPersonCircle,
  BsSearch,
} from "react-icons/bs";

const navigationItems = [
  { id: "tracker", label: "My Tracker", Icon: BsGridFill },
  { id: "search", label: "Find Jobs", Icon: BsSearch },
  { id: "remote", label: "Remote Jobs", Icon: BsGlobe2 },
];

function Dashboard({ onLogout }) {
  const { jobs } = useJobs();
  const [showModal, setShowModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("tracker");

  const savedAuth = localStorage.getItem("auth");
  const authData = savedAuth ? JSON.parse(savedAuth) : null;
  const accountEmail = authData?.user?.email || "Signed-in account";
  const accountName = authData?.user?.name || "Account";
  const displayName = accountName;

  const filteredJobs = jobs.filter((job) => {
    const company = String(job.company ?? job.company_name ?? "").toLowerCase();
    const title = String(
      job.title ?? job.role ?? job.job_title ?? ""
    ).toLowerCase();
    const searchTerm = search.trim().toLowerCase();
    const matchesSearch =
      !searchTerm || company.includes(searchTerm) || title.includes(searchTerm);
    const matchesFilter =
      filter === "All" || job.status?.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleLogout = () => {
    setShowAccountMenu(false);
    onLogout();
  };

  const renderNavigation = (className) => (
    <nav className={className} aria-label="Primary navigation">
      {navigationItems.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            className={`app__nav-item ${
              isActive ? "app__nav-item--active" : ""
            }`}
            onClick={() => setActiveTab(id)}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="app__nav-icon" aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="app">
      <aside className="app__sidebar">
        <div className="app__sidebar-brand">
          <span className="app__brand-mark" aria-hidden="true">
            A
          </span>
          <span className="app__brand-name">ApplyFlow</span>
        </div>

        {renderNavigation("app__sidebar-nav")}

        <button
          type="button"
          className="app__sidebar-account"
          onClick={() => setShowAccountMenu((isOpen) => !isOpen)}
          aria-expanded={showAccountMenu}
          aria-label="Open account menu"
        >
          <BsPersonCircle className="app__account-icon" aria-hidden="true" />
          <span className="app__sidebar-account-copy">
            <strong>{displayName}</strong>
            <small>Account</small>
          </span>
        </button>
      </aside>

      <div className="app__main">
        <header className="app__header">
          <div className="app__header-copy">
            <div className="app__mobile-brand" aria-label="ApplyFlow">
              <span className="app__brand-mark" aria-hidden="true">
                A
              </span>
              <span className="app__brand-name">ApplyFlow</span>
            </div>
            <h1 className="app__title">Job Tracker</h1>
          </div>

          <div className="app__header-actions">
            {activeTab === "tracker" && (
              <button
                type="button"
                className="app__add-btn app__add-btn--header"
                onClick={() => setShowModal(true)}
              >
                + Add Job
              </button>
            )}

            <button
              type="button"
              className="app__account-trigger"
              onClick={() => setShowAccountMenu((isOpen) => !isOpen)}
              aria-expanded={showAccountMenu}
              aria-label="Open account menu"
            >
              <BsPersonCircle className="app__account-icon" aria-hidden="true" />
              <span>Account</span>
            </button>
          </div>
        </header>

        {showAccountMenu && (
          <div className="app__account-menu" role="menu">
            <div className="app__account-menu-header">
              <strong>{displayName}</strong>
              <span>{accountEmail}</span>
            </div>
            <button
              type="button"
              className="app__logout-btn"
              onClick={handleLogout}
              role="menuitem"
            >
              <BsBoxArrowRight aria-hidden="true" />
              Log out
            </button>
          </div>
        )}

        <main className="app__content">
          {activeTab === "tracker" && (
            <>
              <section className="welcome-panel" aria-labelledby="welcome-title">
                <div>
                  <p className="welcome-panel__eyebrow">YOUR JOB SEARCH</p>
                  <h2 id="welcome-title">
                    Welcome back <span aria-hidden="true">👋</span>
                  </h2>
                  <p>Ready to keep your job search moving?</p>
                </div>
                <span className="welcome-panel__mark" aria-hidden="true">
                  ✦
                </span>
              </section>
              <StatsBar />
              <SearchBar
                search={search}
                onSearch={setSearch}
                filter={filter}
                onFilter={setFilter}
              />

              {search.trim() && filteredJobs.length === 0 && jobs.length > 0 && (
                <p className="tracker-no-results" role="status">
                  No applications match “{search}”. Try another company or title.
                </p>
              )}

              <KanbanBoard
                filteredJobs={filteredJobs}
                isSearching={Boolean(search.trim())}
              />
            </>
          )}
          {activeTab === "search" && <JobSearch />}
          {activeTab === "remote" && <RemoteJobs />}
        </main>
      </div>

      {renderNavigation("app__bottom-nav")}

      {showModal && <AddJobModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

export default Dashboard;
