import { useState } from "react"
import { useJobs } from "../../context/JobContext"
import { BsBriefcaseFill, BsLink45Deg, BsX } from "react-icons/bs"
import "./AddJobModal.css"

const INITIAL_FORM = {
  company: "",
  title: "",
  url: "",
  status: "applied",
}

const STATUS_OPTIONS = [
  {
    value: "wishlist",
    label: "Wishlist",
    description: "Maybe later",
    color: "#9ca3af",
  },
  {
    value: "applied",
    label: "Applied",
    description: "Application sent",
    color: "#3b82f6",
  },
  {
    value: "interviewing",
    label: "Interviewing",
    description: "Next steps ahead",
    color: "#f59e0b",
  },
  {
    value: "offer",
    label: "Offer",
    description: "Offer received",
    color: "#10b981",
  },
  {
    value: "rejected",
    label: "Rejected",
    description: "Keep moving forward",
    color: "#ef4444",
  },
  {
    value: "accepted",
    label: "Accepted",
    description: "Role accepted",
    color: "#8b5cf6",
  },
]

function AddJobModal({ onClose }) {
  const { addJob } = useJobs()
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm((currentForm) => ({
      ...currentForm,
      [e.target.name]: e.target.value,
    }))
    if (error) setError("")
  }

  const handleStatusChange = (status) => {
    setForm((currentForm) => ({ ...currentForm, status }))
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.company.trim() || !form.title.trim()) {
      setError("Company and title are required.")
      return
    }

    setIsSubmitting(true)
    const result = await addJob(form)

    if (result.success) {
      setForm(INITIAL_FORM)
      setError("")
      onClose()
    } else {
      setError(result.error || "Failed to save application.")
      setIsSubmitting(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) onClose()
  }

  return (
    <div className="modal__backdrop" onClick={handleBackdropClick}>
      <section
        className="modal__box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-job-title"
      >
        <div className="modal__header">
          <div className="modal__heading">
            <span className="modal__icon" aria-hidden="true">
              <BsBriefcaseFill />
            </span>
            <div>
              <p className="modal__eyebrow">NEW TRACKER ITEM</p>
              <h2 id="add-job-title" className="modal__title">
                Add an application
              </h2>
              <p className="modal__subtitle">
                Keep your next opportunity organized from the start.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close add application dialog"
          >
            <BsX aria-hidden="true" />
          </button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          {error && (
            <p className="modal__error" role="alert">
              {error}
            </p>
          )}

          <div className="modal__field">
            <label htmlFor="company">Company *</label>
            <input
              id="company"
              name="company"
              type="text"
              placeholder="e.g. Paystack"
              value={form.company}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={Boolean(error && !form.company.trim())}
            />
          </div>

          <div className="modal__field">
            <label htmlFor="title">Job title *</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Backend Developer"
              value={form.title}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={Boolean(error && !form.title.trim())}
            />
          </div>

          <div className="modal__field">
            <label htmlFor="url">Job link <span>(optional)</span></label>
            <div className="modal__input-wrap">
              <BsLink45Deg className="modal__field-icon" aria-hidden="true" />
              <input
                id="url"
                name="url"
                type="url"
                placeholder="https://..."
                value={form.url}
                onChange={handleChange}
              />
            </div>
          </div>

          <fieldset className="modal__status-field">
            <legend>Status</legend>
            <div className="modal__status-grid">
              {STATUS_OPTIONS.map((option) => {
                const isSelected = form.status === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`modal__status-option ${
                      isSelected ? "modal__status-option--selected" : ""
                    }`}
                    onClick={() => handleStatusChange(option.value)}
                    aria-pressed={isSelected}
                  >
                    <span
                      className="modal__status-dot"
                      style={{ backgroundColor: option.color }}
                      aria-hidden="true"
                    />
                    <span className="modal__status-copy">
                      <strong>{option.label}</strong>
                      <small>{option.description}</small>
                    </span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="modal__actions">
            <button
              type="button"
              className="modal__btn modal__btn--cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal__btn modal__btn--submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save application"}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default AddJobModal
