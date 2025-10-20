// // Provided in the query, unchanged
// import React, { useState } from "react";
// import { Link } from "react-router-dom";

// const Home = () => {
//   const [form, setForm] = useState({ name: "", email: "", message: "" });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert(`Message Sent!\n\nName: ${form.name}\nEmail: ${form.email}\nMessage: ${form.message}`);
//     setForm({ name: "", email: "", message: "" });
//   };

//   return (
//     <>
//       <style>{`
//         body {
//           margin: 0;
//           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//           background-color: #f9f9f9;
//           color: #333;
//         }
//         .hero {
//           background: linear-gradient(135deg, #007bff, #00bcd4);
//           color: white;
//           padding: 4rem 1rem;
//           text-align: center;
//         }
//         .hero h2 {
//           font-size: 2.5rem;
//           margin-bottom: 1rem;
//         }
//         .hero p {
//           font-size: 1.2rem;
//           margin-bottom: 2rem;
//         }
//         .cta-buttons {
//           display: flex;
//           gap: 1rem;
//           justify-content: center;
//         }
//         .btn {
//           padding: 0.75rem 1.5rem;
//           border-radius: 4px;
//           text-decoration: none;
//           font-weight: bold;
//           transition: background 0.3s ease;
//         }
//         .btn-primary {
//           background: #fff;
//           color: #007bff;
//         }
//         .btn-primary:hover {
//           background: #e0e0e0;
//         }
//         .btn-secondary {
//           background: #333;
//           color: white;
//         }
//         .btn-secondary:hover {
//           background: #555;
//         }
//         .features {
//           padding: 4rem 1rem;
//           background: #fff;
//           text-align: center;
//         }
//         .section-title {
//           font-size: 2rem;
//           margin-bottom: 2rem;
//           color: #007bff;
//         }
//         .features-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
//           gap: 2rem;
//           max-width: 1100px;
//           margin: 0 auto;
//         }
//         .feature-card {
//           background: #f1f8ff;
//           padding: 2rem;
//           border-radius: 8px;
//           box-shadow: 0 2px 6px rgba(0,0,0,0.1);
//           transition: transform 0.3s ease;
//         }
//         .feature-card:hover {
//           transform: translateY(-5px);
//         }
//         .feature-icon {
//           font-size: 2rem;
//           color: #007bff;
//           margin-bottom: 1rem;
//         }
//         .contact-section {
//           display: grid;
//           grid-template-columns: 2fr 1fr;
//           max-width: 1100px;
//           margin: 3rem auto;
//           gap: 2rem;
//           padding: 2rem;
//           background: #fff;
//           border-radius: 10px;
//           box-shadow: 0 4px 8px rgba(0,0,0,0.1);
//         }
//         .contact-form h2 {
//           color: #d32f2f;
//           margin-bottom: 1rem;
//         }
//         .contact-form form {
//           display: flex;
//           flex-direction: column;
//           gap: 1rem;
//         }
//         .contact-form input, 
//         .contact-form textarea {
//           width: 100%;
//           padding: 0.75rem;
//           border: 1px solid #ccc;
//           border-radius: 5px;
//         }
//         .contact-form button {
//           background: #d32f2f;
//           color: white;
//           border: none;
//           padding: 0.75rem;
//           border-radius: 5px;
//           cursor: pointer;
//           font-weight: bold;
//         }
//         .contact-form button:hover {
//           background: #b71c1c;
//         }
//         .find-us {
//           background: linear-gradient(135deg, #333, #555);
//           color: white;
//           padding: 2rem;
//           border-radius: 10px;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//         }
//         .find-us h2 {
//           margin-bottom: 1rem;
//           color: white;
//         }
//         .find-us button {
//           margin-top: 1rem;
//           background: #ff5252;
//           border: none;
//           color: white;
//           padding: 0.75rem;
//           border-radius: 5px;
//           cursor: pointer;
//         }
//         .find-us button:hover {
//           background: #e53935;
//         }
//       `}</style>

      
//       <section className="hero">
//         <div className="container">
//           <h2>Your Health, Our Priority</h2>
//           <p>Experience seamless healthcare management with our comprehensive Hospital Management System for patients, doctors, and administrators.</p>
//           <div className="cta-buttons">
//             <Link to="/register" className="btn btn-primary">Get Started</Link>
//             <Link to="/login" className="btn btn-secondary">Login to Dashboard</Link>
//           </div>
//         </div>
//       </section>

      
//       <section id="features" className="features">
//         <div className="container">
//           <h2 className="section-title">Our Features</h2>
//           <div className="features-grid">
//             <div className="feature-card">
//               <div className="feature-icon"><i className="fas fa-user-plus"></i></div>
//               <h3>Patient Management</h3>
//               <p>Register, update profiles, book appointments, and view prescriptions securely.</p>
//             </div>
//             <div className="feature-card">
//               <div className="feature-icon"><i className="fas fa-calendar-check"></i></div>
//               <h3>Appointment Scheduling</h3>
//               <p>Book, reschedule, or cancel appointments with real-time doctor availability.</p>
//             </div>
//             <div className="feature-card">
//               <div className="feature-icon"><i className="fas fa-prescription"></i></div>
//               <h3>Prescription Management</h3>
//               <p>Doctors issue digital prescriptions; patients view details and history.</p>
//             </div>
//             <div className="feature-card">
//               <div className="feature-icon"><i className="fas fa-user-md"></i></div>
//               <h3>Doctor Tools</h3>
//               <p>Manage patient records, set availability, and handle consultations efficiently.</p>
//             </div>
//           </div>
//         </div>
//       </section>

    
//       <section id="contact" className="contact-section">
//         <div className="contact-form">
//           <h2>CONTACT US</h2>
//           <form onSubmit={handleSubmit}>
//             <input type="text" name="name" placeholder="Full Name*" value={form.name} onChange={handleChange} required />
//             <input type="email" name="email" placeholder="Email*" value={form.email} onChange={handleChange} required />
//             <textarea name="message" rows="5" placeholder="Message*" value={form.message} onChange={handleChange} required></textarea>
//             <button type="submit">Submit</button>
//           </form>
//         </div>
//         <div className="find-us">
//           <h2>FIND US</h2>
//           <p>With more than 40 offices worldwide, we are closer than you think. We also offer a wide variety of online support services such as email support, live chat, and case submission online. Available 24/7, every day of the week.</p>
//           <button>Find locations →</button>
//         </div>
//       </section>
//     </>
//   );
// };

// export default Home;
// import React, { useState } from "react";
// import { Link } from "react-router-dom";

// const Home = () => {
//   const [form, setForm] = useState({ name: "", email: "", message: "" });

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert(`Message Sent!\n\nName: ${form.name}\nEmail: ${form.email}\nMessage: ${form.message}`);
//     setForm({ name: "", email: "", message: "" });
//   };

  
//   const sectionStyle = {
//     maxWidth: "1100px",
//     margin: "0 auto",
//     padding: "3rem 1rem",
//   };

//   const buttonStyle = {
//     padding: "0.75rem 1.5rem",
//     borderRadius: "6px",
//     border: "none",
//     cursor: "pointer",
//     fontWeight: "600",
//     transition: "all 0.3s ease",
//   };

//   return (
//     <>
//       {/* Hero Section */}
//       <section style={{
//         background: "linear-gradient(135deg, #007bff, #00bcd4)",
//         color: "#fff",
//         textAlign: "center",
//         padding: "6rem 1rem",
//       }}>
//         <h2 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Your Health, Our Priority</h2>
//         <p style={{ fontSize: "1.2rem", marginBottom: "2rem", maxWidth: "700px", margin: "0 auto" }}>
//           Experience seamless healthcare management with our comprehensive Hospital Management System for patients, doctors, and administrators.
//         </p>
//         <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
//           <Link to="/register" style={{ ...buttonStyle, backgroundColor: "#fff", color: "#007bff" }}>Get Started</Link>
//           <Link to="/login" style={{ ...buttonStyle, backgroundColor: "#333", color: "#fff" }}>Login to Dashboard</Link>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section style={{ ...sectionStyle, textAlign: "center" }}>
//         <h2 style={{ color: "#007bff", fontSize: "2.5rem", marginBottom: "2rem" }}>Our Features</h2>
//         <div style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
//           gap: "2rem"
//         }}>
//           {[
//             { icon: "👤", title: "Patient Management", desc: "Register, update profiles, book appointments, and view prescriptions securely." },
//             { icon: "📅", title: "Appointment Scheduling", desc: "Book, reschedule, or cancel appointments with real-time doctor availability." },
//             { icon: "💊", title: "Prescription Management", desc: "Doctors issue digital prescriptions; patients view details and history." },
//             { icon: "🩺", title: "Doctor Tools", desc: "Manage patient records, set availability, and handle consultations efficiently." }
//           ].map((feature, i) => (
//             <div key={i} style={{
//               background: "#f1f8ff",
//               padding: "2rem",
//               borderRadius: "10px",
//               boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
//               transition: "transform 0.3s",
//               cursor: "pointer"
//             }}
//             onMouseOver={e => e.currentTarget.style.transform = "translateY(-5px)"}
//             onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
//             >
//               <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{feature.icon}</div>
//               <h3 style={{ marginBottom: "1rem", fontSize: "1.4rem" }}>{feature.title}</h3>
//               <p style={{ fontSize: "1rem", lineHeight: "1.5rem", color: "#333" }}>{feature.desc}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Contact Section */}
//       <section style={{ ...sectionStyle, display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
//         <div style={{ padding: "2rem", background: "#fff", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
//           <h2 style={{ color: "#d32f2f", marginBottom: "1rem" }}>Contact Us</h2>
//           <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
//             <input type="text" name="name" placeholder="Full Name*" value={form.name} onChange={handleChange} required style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #ccc" }} />
//             <input type="email" name="email" placeholder="Email*" value={form.email} onChange={handleChange} required style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #ccc" }} />
//             <textarea name="message" rows="5" placeholder="Message*" value={form.message} onChange={handleChange} required style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}></textarea>
//             <button type="submit" style={{ ...buttonStyle, backgroundColor: "#d32f2f", color: "#fff" }}>Submit</button>
//           </form>
//         </div>
//         <div style={{
//           padding: "2rem",
//           background: "linear-gradient(135deg, #333, #555)",
//           color: "#fff",
//           borderRadius: "10px",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "center"
//         }}>
//           <h2 style={{ marginBottom: "1rem" }}>Find Us</h2>
//           <p style={{ lineHeight: "1.6rem" }}>
//             With more than 40 offices worldwide, we are closer than you think. We also offer online support via email, live chat, and case submission 24/7.
//           </p>
//           <button style={{ ...buttonStyle, backgroundColor: "#ff5252", color: "#fff", marginTop: "1rem" }}>Find locations →</button>
//         </div>
//       </section>
//     </>
//   );
// };

// export default Home;
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `Message Sent!\n\nName: ${form.name}\nEmail: ${form.email}\nMessage: ${form.message}`
    );
    setForm({ name: "", email: "", message: "" });
  };

  const sectionStyle = {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "3rem 1rem",
  };

  const buttonStyle = {
    padding: "0.75rem 1.5rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg, #007bff, #00bcd4)",
          color: "#fff",
          textAlign: "center",
          padding: "6rem 1rem",
        }}
      >
        <h2 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
          Your Health, Our Priority
        </h2>
        <p
          style={{
            fontSize: "1.2rem",
            marginBottom: "2rem",
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          Experience seamless healthcare management with our comprehensive
          Hospital Management System for patients, doctors, and administrators.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/register"
            style={{ ...buttonStyle, backgroundColor: "#fff", color: "#007bff" }}
          >
            Get Started
          </Link>
          <Link
            to="/login"
            style={{ ...buttonStyle, backgroundColor: "#333", color: "#fff" }}
          >
            Login to Dashboard
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ ...sectionStyle, textAlign: "center" }}>
        <h2
          style={{ color: "#007bff", fontSize: "2.5rem", marginBottom: "2rem" }}
        >
          Our Features
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem",
          }}
        >
          {[
            {
              icon: "👤",
              title: "Patient Management",
              desc: "Register, update profiles, book appointments, and view prescriptions securely.",
            },
            {
              icon: "📅",
              title: "Appointment Scheduling",
              desc: "Book, reschedule, or cancel appointments with real-time doctor availability.",
            },
            {
              icon: "💊",
              title: "Prescription Management",
              desc: "Doctors issue digital prescriptions; patients view details and history.",
            },
            {
              icon: "🩺",
              title: "Doctor Tools",
              desc: "Manage patient records, set availability, and handle consultations efficiently.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                background: "#f1f8ff",
                padding: "2rem",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                transition: "transform 0.3s",
                cursor: "pointer",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                {feature.icon}
              </div>
              <h3 style={{ marginBottom: "1rem", fontSize: "1.4rem" }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: "1rem", lineHeight: "1.5rem", color: "#333" }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section
        style={{
          ...sectionStyle,
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "2rem",
        }}
      >
        <div
          style={{
            padding: "2rem",
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ color: "#d32f2f", marginBottom: "1rem" }}>Contact Us</h2>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <input
              type="text"
              name="name"
              placeholder="Full Name*"
              value={form.name}
              onChange={handleChange}
              required
              style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
            />
            <input
              type="email"
              name="email"
              placeholder="Email*"
              value={form.email}
              onChange={handleChange}
              required
              style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
            />
            <textarea
              name="message"
              rows="5"
              placeholder="Message*"
              value={form.message}
              onChange={handleChange}
              required
              style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
            ></textarea>
            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: "#d32f2f", color: "#fff" }}
            >
              Submit
            </button>
          </form>
        </div>
        <div
          style={{
            padding: "2rem",
            background: "linear-gradient(135deg, #333, #555)",
            color: "#fff",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>Find Us</h2>
          <p style={{ lineHeight: "1.6rem" }}>
            With more than 40 offices worldwide, we are closer than you think. We also offer online support via email, live chat, and case submission 24/7.
          </p>
          <button
            style={{ ...buttonStyle, backgroundColor: "#ff5252", color: "#fff", marginTop: "1rem" }}
          >
            Find locations →
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;

