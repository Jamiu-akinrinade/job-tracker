import { createContext, useContext } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const JobContext = createContext()

export function JobProvider({children}) {
    const [jobs, setJobs] = useLocalStorage("jobs", [])

    const addJob = (job) => {
        const newJob = {
            ...job,
            id: Date.now(),
            dateAdded: new Date().toISOString(),

        }
       setJobs ([...jobs, newJob])
    }

  const updateJob = (id, updates) => {
    setJobs(jobs.map((job) => (job.id === id ? {...job, ...updates}: job)))
  }
  const deleteJob = (id) => {
    setJobs(jobs.filter((job) =>  job.id !== id))
  }

  return (
    <JobContext.Provider value={{ jobs, addJob, updateJob, deleteJob }}>
      {children}
    </JobContext.Provider>
  )
}

export function useJobs() {
  return useContext(JobContext)
}