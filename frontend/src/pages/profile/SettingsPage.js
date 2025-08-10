import React from "react";
import Navbar from "../../compoenets/Navbar";
import Sidebar from "../../compoenets/Sidebar";

export default function SettingsPage() {
  return (
    <div className="homepage fade-in">
      <Navbar />
      <div className="content">
        <Sidebar />
        <main className="main-content container mt-4">
          <h2>Settings</h2>
          <div className="glass shadow-soft card-glass mt-16">
            Preferences coming soon.
          </div>
        </main>
      </div>
    </div>
  );
}
