import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function AboutPage() {
  return (
    <div>
      <Navbar />
      <div className="content">
        <Sidebar />
        <main style={{ width: "100%" }}>
          <section className="page-hero">
            <h1 className="page-title">About TrueSphere</h1>
            <p className="page-subtitle">A modern multimedia platform blending videos, news, and AI features.</p>
          </section>

          <div className="container-page" style={{ display: "grid", gap: 16 }}>
            <div className="glass shadow-soft card-glass">
              <h2 style={{ marginTop: 0 }}>Our Mission</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                We aim to create a trusted, knowledge‑driven community by integrating video sharing, credible
                news, and AI-powered experiences like summarization, spam detection, and personalized
                recommendations. TrueSphere helps you discover, create, and engage with content that truly
                matters.
              </p>
            </div>

            <div className="glass shadow-soft card-glass" style={{ marginTop: 16 }}>
              <h2 style={{ marginTop: 0 }}>What Makes Us Different</h2>
              <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: 18 }}>
                <li>Seamless video experience with a sleek, modern interface</li>
                <li>AI-assisted news reading with summaries and credibility signals</li>
                <li>Privacy-first authentication and secure user data handling</li>
                <li>Personalized recommendations powered by our ML backend</li>
                <li>Community-first approach: subscribe, engage, and grow together</li>
              </ul>
            </div>

            <div className="glass shadow-soft card-glass" style={{ marginTop: 16 }}>
              <h2 style={{ marginTop: 0 }}>Our Story</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                TrueSphere started as a student project to reimagine how people consume and share information.
                We blended videos, posts, and news, and layered it with intelligent features so that creators
                and learners can meet in the same place. From there, we kept iterating with a focus on speed,
                reliability, and a clean UX.
              </p>
            </div>

            <div className="glass shadow-soft card-glass" style={{ marginTop: 16 }}>
              <h2 style={{ marginTop: 0 }}>Technology & Security</h2>
              <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: 18 }}>
                <li>MERN stack foundation (MongoDB, Express, React, Node.js)</li>
                <li>Secure authentication with JWT (HttpOnly cookies)</li>
                <li>Passwords hashed with bcrypt; tokens expire and are validated</li>
                <li>AI services for recommendations, summarization, and spam detection</li>
                <li>Cloud media storage and optimized delivery for a smooth experience</li>
              </ul>
            </div>

            <div className="glass shadow-soft card-glass" style={{ marginTop: 16 }}>
              <h2 style={{ marginTop: 0 }}>Core Values</h2>
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <strong>Trust</strong>
                  <p style={{ margin: 0, color: "var(--text-secondary)" }}>We prioritize accuracy, safety, and privacy.</p>
                </div>
                <div>
                  <strong>Creativity</strong>
                  <p style={{ margin: 0, color: "var(--text-secondary)" }}>We empower creators to express and grow.</p>
                </div>
                <div>
                  <strong>Inclusivity</strong>
                  <p style={{ margin: 0, color: "var(--text-secondary)" }}>We design for everyone—simple, fast, and accessible.</p>
                </div>
              </div>
            </div>

            <div className="glass shadow-soft card-glass" style={{ marginTop: 16 }}>
              <h2 style={{ marginTop: 0 }}>Team</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                We are a small, fast-moving team passionate about product quality and user experience. We believe
                in building in public, listening to feedback, and shipping improvements continuously.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


