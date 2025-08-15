import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    // Placeholder submit. Integrate with backend/email service later.
    setTimeout(() => {
      setStatus("success");
    }, 800);
  };

  return (
    <div>
      <Navbar />
      <div className="content">
        <Sidebar />
        <main style={{ width: "100%" }}>
          <section className="page-hero">
            <h1 className="page-title">Contact Us</h1>
            <p className="page-subtitle">Have feedback or questions? We'd love to hear from you.</p>
          </section>

          <div className="container-page">
            <form onSubmit={handleSubmit} className="glass shadow-soft card-glass">
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label>Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control-modern"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control-modern"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-control-modern"
                    placeholder="Write your message..."
                    rows={6}
                    required
                  />
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button type="submit" className="btn-gradient btn-accent" disabled={status === "loading"}>
                    {status === "loading" ? "Sending..." : "Send Message"}
                  </button>
                  {status === "success" && (
                    <span style={{ color: "#22c55e" }}>Thanks! We'll get back to you soon.</span>
                  )}
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}


