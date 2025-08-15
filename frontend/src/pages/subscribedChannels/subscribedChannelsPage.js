import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SubscribedChannelsPage() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const me = await axios.get("http://localhost:5000/api/users/me", { withCredentials: true });
        const currentUser = me.data;
        if (!currentUser?._id) throw new Error("Not logged in");
        const subsRes = await axios.get(`http://localhost:5000/api/users/getUserDetailsById/${currentUser._id}`, { withCredentials: true });
        const userFull = subsRes.data;
        const subscribedIds = userFull.subscribedChannels || [];
        const detailPromises = subscribedIds.map((id) => axios.get(`http://localhost:5000/api/users/getUserDetailsById/${id}`, { withCredentials: true }).then(r => r.data));
        const details = await Promise.all(detailPromises);
        setChannels(details);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="homepage fade-in">
      <Navbar />
      <div className="content">
        <Sidebar />
        <main className="main-content container mt-4">
          <h2>Subscribed Channels</h2>
          {loading && <div>Loading...</div>}
          {error && <div className="text-danger">{error}</div>}
          {!loading && !error && (
            <div className="row g-3">
              {channels.length === 0 && <div className="glass shadow-soft card-glass p-4">No subscriptions yet.</div>}
              {channels.map((ch) => (
                <div className="col-md-4" key={ch._id}>
                  <div className="card p-3 d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => navigate(`/channel/${ch._id}`)}>
                    <img
                      src={ch.logo || "/profilePicture.png"}
                      alt={ch.channelName}
                      style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div className="mt-2 text-center">
                      <div className="fw-bold">{ch.channelName}</div>
                      <small className="text-muted">{ch.subscribers || 0} subscribers</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}