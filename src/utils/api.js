// const API_BASE_URL = "http://localhost:4000/api";


export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";


const handleResponse = async (response ) => {
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));

  const error = new Error(
    errorData.message ||
      errorData.error ||
      `HTTP error! status: ${response.status}`
  );

  error.status = response.status;
  throw error;
}


  // DELETE requests return 204 with no response body.
  if (response.status === 204) return null;

  return response.json();
};

// Reads the JWT saved after login and attaches it to job requests.
export const getAuthHeaders = () => {
  const savedAuth = localStorage.getItem("auth");
  const authData = savedAuth ? JSON.parse(savedAuth) : null;

  return authData?.token
    ? { Authorization: `Bearer ${authData.token}` }
    : {};
};

export const jobApi = {
  getAllJobs: () =>
    fetch(`${API_BASE_URL}/jobs`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  getJobById: (id) =>
    fetch(`${API_BASE_URL}/jobs/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  createJob: (jobData) =>
    fetch(`${API_BASE_URL}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(jobData),
    }).then(handleResponse),

  updateJob: (id, updates) =>
    fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(updates),
    }).then(handleResponse),

  deleteJob: (id) =>
    fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then(handleResponse),
};

export const authApi = {
  register: (userData) =>
    fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    }).then(handleResponse),

    

  login: (credentials) =>
    fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    }).then(handleResponse),

      resendVerification: (email) =>
    fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).then(handleResponse),


      verifyEmail: (token) =>
    fetch(
      `${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`
    ).then(handleResponse),
      forgotPassword: (email) =>
    fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).then(handleResponse),

  resetPassword: ({ token, newPassword }) =>
    fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    }).then(handleResponse),

};