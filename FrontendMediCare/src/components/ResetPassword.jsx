import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../services/api";  // Assuming authAPI has resetPassword method

const ResetPassword = () => {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [searchParams] = useSearchParams();  // To get token from URL
  const navigate = useNavigate();

  useEffect(() => {
    // Extract token from URL params (e.g., ?token=abc123)
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleReset = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (!token.trim() || !newPassword.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      await authAPI.resetPassword(token, newPassword);
      alert("Password reset successful. You can now log in.");
      navigate("/login");
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMessage = error.response?.data?.message || "Error resetting password. Please check the token and try again.";
      alert(errorMessage);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "400px",
        margin: "auto",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h2>Reset Password</h2>
      <input
        placeholder="Token (auto-filled from URL)"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        required
        style={{ width: "100%", padding: "10px", margin: "10px 0" }}
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        style={{ width: "100%", padding: "10px", margin: "10px 0" }}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        style={{ width: "100%", padding: "10px", margin: "10px 0" }}
      />
      <button
        onClick={handleReset}
        style={{
          width: "100%",
          padding: "10px",
          background: "#007bff",
          color: "white",
          border: "none",
        }}
      >
        Reset Password
      </button>
    </div>
  );
};

export default ResetPassword;