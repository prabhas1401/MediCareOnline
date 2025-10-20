// import React from "react";
// import Navbar from "./Navbar";

// const Layout = ({ children }) => {
//   return (
//     <>
//       <Navbar />
//       <main>{children}</main>
//       <footer style={{ background: "#007bff", color: "white", padding: "1rem", textAlign: "center" }}>
//         <p>&copy; {new Date().getFullYear()} MediCare Hospital Management System. All rights reserved.</p>
//       </footer>
//     </>
//   );
// };

// export default Layout;
// import React from "react";
// import Navbar from "./Navbar";
// import { Outlet, useLocation } from "react-router-dom";

// const Layout = () => {
//   const location = useLocation();
//   const isHome = location.pathname === "/";

//   return (
//     <>
//       <>
//   <Navbar />
//   <main style={{ paddingTop: "70px", minHeight: "80vh" }}>
//     <Outlet />
//   </main>
// </>

//       {isHome && (   // Footer only on Home page
//         <footer style={{ background: "#007bff", color: "white", padding: "1rem", textAlign: "center" }}>
//           <p>&copy; {new Date().getFullYear()} MediCare Hospital Management System. All rights reserved.</p>
//         </footer>
//       )}
//     </>
//   );
// };

// export default Layout;

// import React from "react";
// import Navbar from "./Navbar";
// import { Outlet, useLocation } from "react-router-dom";

// const Layout = () => {
//   const location = useLocation();
//   const isHome = location.pathname === "/";

//   return (
//     <>
//       <Navbar />
//       <main style={{ paddingTop: "80px", minHeight: "80vh" }}>
//         <Outlet />
//       </main>
//       {isHome && (
//         <footer style={{ background: "#007bff", color: "white", padding: "1rem", textAlign: "center" }}>
//           <p>&copy; {new Date().getFullYear()} MediCare Hospital Management System. All rights reserved.</p>
//         </footer>
//       )}
//     </>
//   );
// };

// export default Layout;
import React from "react";
import Navbar from "./Navbar";
import { Outlet, useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "80px", minHeight: "80vh" }}>
        <Outlet />
      </main>
      {isHome && (
        <footer style={{
          background: "#007bff",
          color: "#fff",
          padding: "1rem",
          textAlign: "center",
          boxShadow: "0 -2px 6px rgba(0,0,0,0.2)"
        }}>
          <p>&copy; {new Date().getFullYear()} MediCare Hospital Management System. All rights reserved.</p>
        </footer>
      )}
    </>
  );
};

export default Layout;
