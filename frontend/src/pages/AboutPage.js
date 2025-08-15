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

          <div className="container-page">
            <div className="glass shadow-soft card-glass">
              <h2 style={{ marginTop: 0 }}>Our Mission</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                We aim to create a trusted, knowledge-driven community by integrating video sharing, credible news,
                and AI-powered experiences like summarization, spam detection, and personalized recommendations.
              </p>
            </div>

            <div className="glass shadow-soft card-glass" style={{ marginTop: 16 }}>
              <h2 style={{ marginTop: 0 }}>What Makes Us Different</h2>
              <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
                <li>Seamless video experience with a sleek, modern interface</li>
                <li>AI-assisted news reading with summaries and credibility signals</li>
                <li>Privacy-first authentication and secure user data handling</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


