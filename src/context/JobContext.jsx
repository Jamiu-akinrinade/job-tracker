import React, { createContext, useState, useEffect, useContext } from 'react';
import { jobApi } from '../utils/api';

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch all jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await jobApi.getAllJobs();
        console.log("Fetched Jobs:", data);
        const jobsArray = Array.isArray(data) ? data : (data.jobs || []);
        setJobs(jobsArray); 
       
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // 2. Add a new job
  const addJob = async (jobData) => {
    try {
    //  const newJob = await jobApi.createJob(jobData);
     // setJobs((prev) => [...prev, newJob]);

     const response = await jobApi.createJob(jobData);
      setJobs((prev) => [...prev, response.job]); // Extract the single job

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // 3. Update a job (e.g., dragging between Kanban columns)
 // Inside src/context/JobContext.jsx
const updateJob = async (id, updates) => {
  try {
    const response = await jobApi.updateJob(id, updates);
    
    // 💡 THE FIX: Look for 'response.job'. If it's not there, use 'response'
    const updatedJob = response.job || response; 
    
    setJobs((prev) => prev.map(j => j.id === id ? updatedJob : j));
    return { success: true };
  } catch (err) {
    console.error("Update failed:", err.message);
    return { success: false, error: err.message };
  }
};



  // 4. Delete a job
  const deleteJob = async (id) => {
    try {
      await jobApi.deleteJob(id);
      setJobs((prev) => prev.filter(j => j.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <JobContext.Provider value={{ jobs, loading, error, addJob, updateJob, deleteJob }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => useContext(JobContext);