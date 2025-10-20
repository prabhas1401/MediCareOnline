// import React from "react";
// import { Link, useNavigate } from "react-router-dom";

// export default function NavBar() {
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user") || "null");

//   function logout() {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login");
//   }

// //   const navStyle = {
// //     width: "100%",
// //     background: "linear-gradient(90deg, #0062cc, #00bcd4)",
// //     padding: "12px 25px",
// //     boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
// //     color: "#fff",
// //     position: "sticky",
// //     top: 0,
// //     zIndex: 1000,
// //   };
// const navStyle = {
//     width: "100%",
//     background: "linear-gradient(90deg, #0062cc, #00bcd4)",
//     padding: "12px 25px",
//     boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
//     color: "#fff",
//     position: "fixed",  // fixed at top
//     top: 0,
//     left: 0,
//     zIndex: 1000,
// };

  

//   const containerStyle = {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     maxWidth: "1200px",
//     margin: "0 auto",
//   };

//   const brandContainer = {
//     display: "flex",
//     alignItems: "center",
//     gap: "10px",
//     textDecoration: "none",
//   };

//   const brandIcon = {
//     fontSize: "1.6rem",
//   };

//   const brandStyle = {
//     fontWeight: "700",
//     fontSize: "1.4rem",
//     color: "#fff",
//     textDecoration: "none",
//     letterSpacing: "0.5px",
//   };

//   const linkContainer = {
//     display: "flex",
//     alignItems: "center",
//   };

//   const linkStyle = {
//     color: "#fff",
//     textDecoration: "none",
//     marginLeft: "18px",
//     fontWeight: "500",
//     transition: "color 0.3s ease",
//   };

//   const buttonStyle = {
//     marginLeft: "18px",
//     padding: "6px 14px",
//     border: "none",
//     borderRadius: "4px",
//     backgroundColor: "#e74c3c",
//     color: "#fff",
//     cursor: "pointer",
//     fontWeight: "500",
//     transition: "background 0.3s ease",
//   };

//   return (
//     <div style={navStyle}>
//       <div style={containerStyle}>
//         <Link to="/" style={brandContainer}>
//           <span style={brandIcon}>🩺</span>
//           <span style={brandStyle}>MediCare+</span>
//         </Link>
//         <div style={linkContainer}>
//           <Link to="/" style={linkStyle}>
//             Home
//           </Link>
//           {user ? (
//             <>
//               {user.role === "ADMIN" && (
//                 <Link to="/admin" style={linkStyle}>
//                   Admin
//                 </Link>
//               )}
//               <button style={buttonStyle} onClick={logout}>
//                 Logout
//               </button>
//             </>
//           ) : (
//             <>
//               <Link to="/login" style={linkStyle}>
//                 Login
//               </Link>
//               <Link to="/register" style={linkStyle}>
//                 Register
//               </Link>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// import React from "react";
// import { Link, useNavigate } from "react-router-dom";

// export default function Navbar() {
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user") || "null");

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const navStyle = {
//     width: "100%",
//     background: "linear-gradient(90deg, #0062cc, #00bcd4)",
//     padding: "12px 25px",
//     boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
//     color: "#fff",
//     position: "fixed", // fixed at top
//     top: 0,
//     left: 0,
//     zIndex: 9999,
//   };

//   const containerStyle = {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     maxWidth: "1200px",
//     margin: "0 auto",
//   };

//   const brandContainer = {
//     display: "flex",
//     alignItems: "center",
//     gap: "10px",
//     textDecoration: "none",
//   };

//   const brandIcon = { fontSize: "1.6rem" };
//   const brandStyle = { fontWeight: "700", fontSize: "1.4rem", color: "#fff", textDecoration: "none" };
//   const linkContainer = { display: "flex", alignItems: "center" };
//   const linkStyle = { color: "#fff", textDecoration: "none", marginLeft: "18px", fontWeight: "500" };
//   const buttonStyle = {
//     marginLeft: "18px",
//     padding: "6px 14px",
//     border: "none",
//     borderRadius: "4px",
//     backgroundColor: "#e74c3c",
//     color: "#fff",
//     cursor: "pointer",
//     fontWeight: "500",
//   };

//   return (
//     <div style={navStyle}>
//       <div style={containerStyle}>
//         <Link to="/" style={brandContainer}>
//           <span style={brandIcon}>🩺</span>
//           <span style={brandStyle}>MediCare+</span>
//         </Link>
//         <div style={linkContainer}>
//           <Link to="/" style={linkStyle}>Home</Link>
//           {user ? (
//             <>
//               {user.role === "ADMIN" && <Link to="/admin" style={linkStyle}>Admin</Link>}
//               {user.role === "DOCTOR" && <Link to="/doctor" style={linkStyle}>Doctor</Link>}
//               {user.role === "PATIENT" && <Link to="/patient" style={linkStyle}>Patient</Link>}
//               <button style={buttonStyle} onClick={logout}>Logout</button>
//             </>
//           ) : (
//             <>
//               <Link to="/login" style={linkStyle}>Login</Link>
//               <Link to="/register" style={linkStyle}>Register</Link>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navStyle = {
    width: "100%",
    background: "linear-gradient(90deg, #0062cc, #00bcd4)",
    padding: "15px 25px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    color: "#fff",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 9999,
  };

  const containerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "0 auto",
    flexWrap: "wrap",
  };

  const brandStyle = { fontWeight: "700", fontSize: "1.5rem", color: "#fff", textDecoration: "none" };
  const linkStyle = { color: "#fff", textDecoration: "none", marginLeft: "20px", fontWeight: "500" };
  const buttonStyle = {
    marginLeft: "20px",
    padding: "6px 14px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#e74c3c",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500",
  };

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <span style={{ fontSize: "1.6rem" }}>🩺</span>
          <span style={brandStyle}>MediCare+</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          <Link to="/" style={linkStyle}>Home</Link>
          {user ? (
            <>
              {user.role === "ADMIN" && <Link to="/admin" style={linkStyle}>Admin</Link>}
              {user.role === "DOCTOR" && <Link to="/doctor" style={linkStyle}>Doctor</Link>}
              {user.role === "PATIENT" && <Link to="/patient" style={linkStyle}>Patient</Link>}
              <button style={buttonStyle} onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={linkStyle}>Login</Link>
              <Link to="/register" style={linkStyle}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

