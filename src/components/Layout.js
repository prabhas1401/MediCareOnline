import React from "react";
import Navbar from "./NavBar";

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <footer style={{ background: "#007bff", color: "white", padding: "1rem", textAlign: "center" }}>
        <p>&copy; {new Date().getFullYear()} MediCare Hospital Management System. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Layout;