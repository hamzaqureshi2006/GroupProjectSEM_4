import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [consent, setConsent] = useState(true);

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

          <div className="container-page" style={{ display: "grid", gap: 16 }}>
            <div className="glass shadow-soft card-glass">
              <h2 style={{ marginTop: 0 }}>Get in touch</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: 0 }}>
                Our team typically responds within 1–2 business days. For partnership or media inquiries,
                mention the topic in your message subject.
              </p>
            </div>

            <div className="glass shadow-soft card-glass">
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gap: 16 }}>
                  <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
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
                  </div>
                  <div>
                    <label>Subject</label>
                    <input
                      name="subject"
                      value={formData.subject || ""}
                      onChange={handleChange}
                      className="form-control-modern"
                      placeholder="How can we help?"
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
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <input
                      id="consent"
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      style={{ marginTop: 4 }}
                    />
                    <label htmlFor="consent" style={{ color: "var(--text-secondary)" }}>
                      I agree to be contacted about my request and understand my data will be handled in
                      accordance with the privacy policy.
                    </label>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <button type="submit" className="btn-gradient btn-accent" disabled={status === "loading" || !consent}>
                      {status === "loading" ? "Sending..." : "Send Message"}
                    </button>
                    {status === "success" && (
                      <span style={{ color: "#22c55e" }}>Thanks! We'll get back to you soon.</span>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="glass shadow-soft card-glass" style={{ display: "grid", gap: 8 }}>
              <h2 style={{ marginTop: 0 }}>Company</h2>
              <div style={{ display: "grid", gap: 4, color: "var(--text-secondary)" }}>
                <div><strong>Email:</strong> support@truesphere.app</div>
                <div><strong>Hours:</strong> Mon–Fri, 10:00–18:00 IST</div>
                <div><strong>Location:</strong> Remote‑first</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


