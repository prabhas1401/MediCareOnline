import React from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleGoToDashboard = () => {
    if (role === "ADMIN") navigate("/admin");
    else if (role === "DOCTOR") navigate("/doctor");
    else if (role === "PATIENT") navigate("/patient");
  };

  return (
    <div style={{ padding: "5rem", textAlign: "center", fontFamily: "Poppins, sans-serif", background: "linear-gradient(135deg, #0062cc, #00bcd4)", color: "white", minHeight: "100vh" }}>
      <h1>Welcome to Medicare!</h1>
      <p>You are logged in as {role}.</p>
      <button onClick={handleGoToDashboard} style={{ padding: "1rem 2rem", background: "#fff", color: "#007bff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>Go to Dashboard</button>
    </div>
  );
};

export default Welcome;