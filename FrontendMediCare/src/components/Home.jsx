import React, { useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Message Sent!\n\nName: ${form.name}\nEmail: ${form.email}\nMessage: ${form.message}`);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          background-color: #f4f8fb;
          color: #333;
        }
        .hero {
          background: linear-gradient(135deg, #0062cc, #00bcd4);
          color: white;
          padding: 5rem 1rem;
          text-align: center;
        }
        .hero h2 {
          font-size: 2.8rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .hero p {
          font-size: 1.1rem;
          margin-bottom: 2.2rem;
          max-width: 700px;
          margin-inline: auto;
          line-height: 1.6;
        }
        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn {
          padding: 0.8rem 1.6rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          transition: background 0.3s ease, transform 0.2s ease;
        }
        .btn-primary {
          background: #fff;
          color: #007bff;
        }
        .btn-primary:hover {
          background: #f1f1f1;
          transform: translateY(-2px);
        }
        .btn-secondary {
          background: #004085;
          color: white;
        }
        .btn-secondary:hover {
          background: #002752;
          transform: translateY(-2px);
        }

        .features {
          padding: 4rem 1rem;
          background: #fff;
          text-align: center;
        }
        .section-title {
          font-size: 2rem;
          margin-bottom: 2rem;
          color: #007bff;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 2rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .feature-card {
          background: #f8fbff;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }
        .feature-icon {
          font-size: 2rem;
          color: #00bcd4;
          margin-bottom: 1rem;
        }

        .contact-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          max-width: 1100px;
          margin: 3rem auto;
          gap: 2rem;
          padding: 2rem;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .contact-form h2 {
          color: #007bff;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        .contact-form form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .contact-form input, 
        .contact-form textarea {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.3s;
        }
        .contact-form input:focus, 
        .contact-form textarea:focus {
          border-color: #007bff;
        }
        .contact-form button {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.8rem;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.3s ease;
        }
        .contact-form button:hover {
          background: #0056b3;
        }

        .find-us {
          background: linear-gradient(135deg, #333, #555);
          color: white;
          padding: 2rem;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .find-us h2 {
          margin-bottom: 1rem;
          color: #fff;
        }
        .find-us p {
          line-height: 1.5;
        }
        .find-us button {
          margin-top: 1rem;
          background: #ff5252;
          border: none;
          color: white;
          padding: 0.75rem;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
        }
        .find-us button:hover {
          background: #e53935;
        }

        @media (max-width: 768px) {
          .contact-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="hero">
        <h2>Your Health, Our Priority</h2>
        <p>
          Empowering hospitals and healthcare professionals with a modern, efficient, and connected platform for patient care and management.
        </p>
        <div className="cta-buttons">
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Login to Dashboard
          </Link>
        </div>
      </section>

      <section id="features" className="features">
        <h2 className="section-title">Our Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Patient Management</h3>
            <p>Manage patient registrations, profiles, and appointments seamlessly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Appointment Scheduling</h3>
            <p>Schedule and manage appointments with real-time availability tracking.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💊</div>
            <h3>Prescription Management</h3>
            <p>Doctors can issue and update prescriptions digitally and securely.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🩺</div>
            <h3>Doctor Tools</h3>
            <p>Comprehensive tools to manage consultations, patients, and records efficiently.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="contact-form">
          <h2>Contact Us</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Full Name*" value={form.name} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email*" value={form.email} onChange={handleChange} required />
            <textarea name="message" rows="5" placeholder="Message*" value={form.message} onChange={handleChange} required></textarea>
            <button type="submit">Submit</button>
          </form>
        </div>
        <div className="find-us">
          <h2>Find Us</h2>
          <p>With offices across multiple cities, our support is always within reach. Get in touch anytime — 24/7 assistance available.</p>
          <button>Find Locations →</button>
        </div>
      </section>
    </>
  );
};

export default Home;