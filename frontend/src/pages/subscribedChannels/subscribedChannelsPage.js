import React from "react";
import Navbar from "../../compoenets/Navbar";
import Sidebar from "../../compoenets/Sidebar";

export default function SubscribedChannelsPage() {
  return (
    <div className="homepage fade-in">
      <Navbar />
      <div className="content">
        <Sidebar />
        <main className="main-content container mt-4">
          <h2>Subscribed Channels</h2>
          <div className="glass shadow-soft card-glass mt-16">
            Coming soon: list of channels you follow.
          </div>
        </main>
      </div>
    </div>
  );
}