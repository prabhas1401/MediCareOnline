import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove token or any user data
    localStorage.removeItem("token");
    localStorage.removeItem("role"); // optional if you store role
    navigate("/login"); // redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        backgroundColor: "#f44336",
        color: "#fff",
        padding: "8px 16px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginTop: "20px",
      }}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
