import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import axios from "axios";


// This page displays the liked videos of the user
function LikedVideosPage() {

    const navigate = useNavigate();

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/videos/watchedVideos", { withCredentials: true });
                setVideos(res.data);
            } catch (err) {
                console.error("Error fetching search results:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    return (
        <div className="homepage fade-in">
            <Navbar />
            <div className="content">
                <Sidebar />

                <div className="container mt-4">

                    {loading ? (
                        <div className="grid-gap-16 mt-16">
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <div key={idx} className="card glass shadow-soft">
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="skeleton skeleton-thumb" />
                                        </div>
                                        <div className="col-md-8">
                                            <div className="skeleton skeleton-text" style={{ width: "60%" }} />
                                            <div className="skeleton skeleton-text" style={{ width: "40%" }} />
                                            <div className="skeleton skeleton-text" style={{ width: "30%" }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : videos.length === 0 ? (
                        <p>There are no Watched Videos.</p>
                    ) : (
                        <div className="grid-gap-16 mt-16">
                            {videos.map(video => (
                                <div key={video._id} className="card glass shadow-soft" style={{ cursor: "pointer", padding: 12 }} onClick={() => navigate(`/watch?video_id=${video._id}`)}>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <img src={video.thumbnail_url} alt={video.title} className="img-fluid" style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: 12 }} />
                                        </div>
                                        <div className="col-md-8">
                                            <h5 style={{ marginTop: 8 }}>{video.title}</h5>
                                            <p className="mb-1 text-secondary">{video.category}</p>
                                            <small className="text-secondary">{video.views} views • {new Date(video.timestamp).toLocaleDateString()}</small>
                                            <div className="mt-12">
                                                {video.tags && video.tags.map((tag, idx) => (
                                                    <span key={idx} className="badge bg-secondary me-1">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LikedVideosPage;
