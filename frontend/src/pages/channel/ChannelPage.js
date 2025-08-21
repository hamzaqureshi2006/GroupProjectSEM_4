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
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, videosRes, postsRes, meRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/users/getUserDetailsById/${id}`, { withCredentials: true }),
          axios.get(`http://localhost:5000/api/videos/byUser/${id}`),
          axios.get(`http://localhost:5000/api/posts/byUser/${id}`),
          axios.get('http://localhost:5000/api/users/me', { withCredentials: true })
        ]);
        setChannel(userRes.data);
        setVideos(videosRes.data || []);
        setPosts(postsRes.data.posts || []);
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
                {['Home', 'Videos', 'Posts'].map(tab => (
                  <li className="nav-item" key={tab}>
                    <button className={`nav-link ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
                  </li>
                ))}
              </ul>
              {activeTab === 'Posts' && (
                <div className="row g-3 mt-2">
                
                  {posts.length === 0 ? (
                    <div className="text-center" style={{ color: '#A9A9A9' }}>No posts yet.</div>
                  ) : (
                    posts.map(post => (
                      <div className="col-md-6" key={post._id}>
                        <div className="card glass shadow-soft p-2 mb-3">
                          {post.image_url && (
                            <img src={post.image_url} alt={post.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }} />
                          )}
                          <div className="p-2">
                            <div className="fw-bold">{post.title}</div>
                            <small className="text-muted">{post.views} views • {new Date(post.timestamp).toLocaleDateString()}</small>
                            <p className="mt-2" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</p>
                            <div className="d-flex align-items-center mt-2">
                              <span className="me-3">
                                <i className="fas fa-heart text-danger me-1"></i>
                                {post.likes} likes
                              </span>
                            </div>
                            {post.tags && post.tags.length > 0 && (
                              <div className="mt-2">
                                {post.tags.slice(0, 3).map((tag, idx) => (
                                  <span key={idx} className="badge bg-secondary me-1">{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                </div>
              )}

              {/* Tab Content */}
              {activeTab === 'Home' && (
                <div className="mt-3 text-center" style={{ color: '#A9A9A9' }}>Welcome to {channel.channelName}'s channel.</div>
              )}

              {activeTab === 'Videos' && (
                <div className="row g-3 mt-2">
                  {videos.length === 0 ? (
                    <div className="text-center" style={{ color: '#A9A9A9' }}>No videos yet.</div>
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

              
            </>
          )}
        </main>
      </div>
    </div>
  );
}
