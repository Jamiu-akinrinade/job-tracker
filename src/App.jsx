import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { JobProvider } from "./context/JobContext";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import VerifyEmail from "./components/Auth/VerifyEmail";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";


import "./index.css";

function App() {
  const [authData, setAuthData] = useState(() => {
    const savedAuth = localStorage.getItem("auth");
    return savedAuth ? JSON.parse(savedAuth) : null;
  });

  const handleLogin = (data) => {
    localStorage.setItem("auth", JSON.stringify(data));
    setAuthData(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setAuthData(null);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authData ? (
            <Navigate to="/" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />
      <Route
          path="/forgot-password"
          element={
            authData ? <Navigate to="/" replace /> : <ForgotPassword />
          }
        />

      <Route
        path="/register"
        element={
          authData ? <Navigate to="/" replace /> : <Register />
        }
      />
  <Route
  path="/reset-password"
  element={
    authData ? <Navigate to="/" replace /> : <ResetPassword />
  }
/>

      <Route
        path="/verify-email"
        element={<VerifyEmail />}
      />

      <Route
        path="/*"
        element={
          authData ? (
            <JobProvider key={authData.user.id}>
              <Dashboard onLogout={handleLogout} />
            </JobProvider>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
