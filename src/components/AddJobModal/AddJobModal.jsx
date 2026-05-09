import { useState } from "react"
import { useJobs } from "../../context/JobContext"
import "./AddJobModal.css"

const INITIAL_FORM = {
  company: "",
  role: "",
  link: "",
  status: "Applied",
}

function AddJobModal({ onClose }) {
  const { addJob } = useJobs()
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.company.trim() || !form.role.trim()) {
      setError("Company and Role are required.")
      return
    }

    addJob(form)
    setForm(INITIAL_FORM)
    setError("")
    onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal__backdrop" onClick={handleBackdropClick}>
      <div className="modal__box">
        <div className="modal__header">
          <h2 className="modal__title">Add New Job</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          {error && <p className="modal__error">{error}</p>}

          <div className="modal__field">
            <label htmlFor="company">Company *</label>
            <input
              id="company"
              name="company"
              type="text"
              placeholder="e.g. Google"
              value={form.company}
              onChange={handleChange}
            />
          </div>

          <div className="modal__field">
            <label htmlFor="role">Role *</label>
            <input
              id="role"
              name="role"
              type="text"
              placeholder="e.g. Frontend Developer"
              value={form.role}
              onChange={handleChange}
            />
          </div>

          <div className="modal__field">
            <label htmlFor="link">Job Link (optional)</label>
            <input
              id="link"
              name="link"
              type="url"
              placeholder="https://..."
              value={form.link}
              onChange={handleChange}
            />
          </div>

          <div className="modal__field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="modal__actions">
            <button
              type="button"
              className="modal__btn modal__btn--cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="modal__btn modal__btn--submit">
              Add Job
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddJobModal