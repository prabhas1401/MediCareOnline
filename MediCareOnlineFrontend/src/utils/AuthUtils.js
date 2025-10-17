// src/utils/AuthUtils.js
import { createContext, useContext, useState, useEffect } from "react";

// Create authentication context
const AuthContext = createContext();

// ✅ Auth Provider (manages login state globally)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  // ✅ Login function
  const login = (email, password) => {
    // Direct Admin Login
    if (email === "admin@hms.com" && password === "admin123") {
      const adminUser = { email, role: "admin", name: "Administrator" };
      localStorage.setItem("loggedInUser", JSON.stringify(adminUser));
      setUser(adminUser);
      return { success: true, role: "admin" };
    }

    // Doctor / Patient (from localStorage)
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      localStorage.setItem("loggedInUser", JSON.stringify(foundUser));
      setUser(foundUser);
      return { success: true, role: foundUser.role };
    }

    return { success: false };
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("loggedInUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hooks & Helpers
export const useAuth = () => useContext(AuthContext);

export const isAuthenticated = () => !!localStorage.getItem("loggedInUser");

export const getUserRole = () => {
  const stored = localStorage.getItem("loggedInUser");
  if (stored) return JSON.parse(stored).role || null;
  return null;
};

export const getUserEmail = () => {
  const stored = localStorage.getItem("loggedInUser");
  if (stored) return JSON.parse(stored).email || null;
  return null;
};