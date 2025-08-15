import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';

export default function ChannelPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Videos');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, videosRes, meRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/users/getUserDetailsById/${id}`, { withCredentials: true }),
          axios.get(`http://localhost:5000/api/videos/byUser/${id}`),
          axios.get('http://localhost:5000/api/users/me', { withCredentials: true })
        ]);
        setChannel(userRes.data);
        setVideos(videosRes.data || []);
        const me = meRes.data;
        if (me?._id && userRes.data?._id) {
          // naive: refetch me full to get subscribedChannels
          const meFullRes = await axios.get(`http://localhost:5000/api/users/getUserDetailsById/${me._id}`, { withCredentials: true });
          const meFull = meFullRes.data;
          setIsSubscribed((meFull.subscribedChannels || []).some(cid => cid.toString() === userRes.data._id.toString()));
        }
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load channel');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleToggleSubscribe = async () => {
    try {
      await axios.get(`http://localhost:5000/api/users/toggleSubscribe/${id}`, { withCredentials: true });
      setIsSubscribed(prev => !prev);
      setChannel(prev => prev ? { ...prev, subscribers: Math.max(0, (prev.subscribers || 0) + (isSubscribed ? -1 : 1)) } : prev);
    } catch (e) {
      alert('Failed to subscribe/unsubscribe');
    }
  };

  return (
    <div className="homepage fade-in">
      <Navbar />
      <div className="content">
        <Sidebar />
        <main className="main-content container mt-4">
          {loading && <div>Loading...</div>}
          {error && <div className="text-danger">{error}</div>}
          {!loading && !error && channel && (
            <>
              {/* Banner */}
              <div
                style={{
                  height: 180,
                  borderRadius: 12,
                  background: channel.banner
                    ? `url(${channel.banner}) center/cover no-repeat`
                    : 'linear-gradient(90deg, #e3f2fd, #fce4ec)'
                }}
              />

              {/* Header */}
              <div className="d-flex align-items-center justify-content-between mt-3">
                <div className="d-flex align-items-center">
                  <img src={channel.logo || '/profilePicture.png'} alt={channel.channelName} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', marginRight: 16, marginTop: -48, border: '4px solid white' }} />
                  <div>
                    <h3 className="mb-1">{channel.channelName}</h3>
                    <div className="text-muted">{channel.subscribers || 0} subscribers</div>
                  </div>
                </div>
                <button className={`${isSubscribed ? 'btn-unsubscribe' : 'btn-subscribe'}`} onClick={handleToggleSubscribe}>
                  {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                </button>
              </div>

              {/* Tabs */}
              <ul className="nav nav-tabs mt-4">
                {['Home', 'Videos', 'Playlists', 'About'].map(tab => (
                  <li className="nav-item" key={tab}>
                    <button className={`nav-link ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
                  </li>
                ))}
              </ul>

              {/* Tab Content */}
              {activeTab === 'Home' && (
                <div className="mt-3 text-muted">Welcome to {channel.channelName}'s channel.</div>
              )}

              {activeTab === 'Videos' && (
                <div className="row g-3 mt-2">
                  {videos.length === 0 ? (
                    <div className="text-muted">No videos yet.</div>
                  ) : (
                    videos.map(v => (
                      <div className="col-md-4" key={v._id}>
                        <div className="card p-2" style={{ cursor: 'pointer' }} onClick={() => navigate(`/watch?video_id=${v._id}`)}>
                          <img src={v.thumbnail_url} alt={v.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }} />
                          <div className="p-2">
                            <div className="fw-bold">{v.title}</div>
                            <small className="text-muted">{v.views} views • {new Date(v.timestamp).toLocaleDateString()}</small>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'Playlists' && (
                <div className="row g-3 mt-2">
                  {/* Placeholder cards for playlists */}
                  {[1,2,3].map((n) => (
                    <div className="col-md-4" key={n}>
                      <div className="card p-2">
                        <div style={{ width: '100%', height: 180, borderRadius: 8, background: '#eceff1' }} />
                        <div className="p-2">
                          <div className="fw-bold">Playlist {n}</div>
                          <small className="text-muted">Coming soon</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'About' && (
                <div className="mt-3 text-muted">This channel profile section is coming soon.</div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
