import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { JobProvider } from "./context/JobContext"
import "./index.css"
import App from "./App"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <JobProvider>
      <App />
    </JobProvider>
  </StrictMode>
)
