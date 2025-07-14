import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../compoenets/Navbar";
import Sidebar from "../../compoenets/Sidebar";
import axios from "axios";


// This page displays the liked videos of the user
function LikedVideosPage() {

    const navigate = useNavigate();

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/videos/likedVideos", { withCredentials: true });
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
        <div className="homepage">
            <Navbar />
            <div className="content">
                <Sidebar />

                <div className="container mt-4">

                    {loading ? (
                        <p>Loading...</p>
                    ) : videos.length === 0 ? (
                        <p>There are no Liked Videos.</p>
                    ) : (
                        <div className="list-group">
                            {videos.map(video => (
                                <div
                                    key={video._id}
                                    className="list-group-item list-group-item-action"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => navigate(`/watch?video_id=${video._id}`)}
                                >
                                    <div className="row">
                                        <div className="col-md-4 bg-dark">
                                            <img
                                                src={video.thumbnail_url}
                                                alt={video.title}
                                                className="img-fluid rounded"
                                                style={{
                                                    width: "100%",        // takes full width of its container
                                                    height: "180px",      // fixed height for consistency
                                                    objectFit: "contain"    // crops neatly without distortion
                                                }}
                                            />
                                        </div>
                                        <div className="col-md-8">
                                            <h5>{video.title}</h5>
                                            <p className="mb-1">{video.category}</p>
                                            <small>{video.views} views • {new Date(video.timestamp).toLocaleDateString()}</small>
                                            <div>
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
