import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../compoenets/Navbar";
import Sidebar from "../../compoenets/Sidebar";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function SearchResultsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("search_query");

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await axios.post("http://localhost:5000/api/videos/search", {
                    query
                });
                setVideos(res.data.results);
            } catch (err) {
                console.error("Error fetching search results:", err);
            } finally {
                setLoading(false);
            }
        };

        if (query) fetchResults();
    }, [query]);

    return (
        <div className="homepage">
            <Navbar />
            <div className="content">
                <Sidebar />

                <div className="container mt-4">
                    <h4>Search results for: <strong>{query}</strong></h4>

                    {loading ? (
                        <p>Loading...</p>
                    ) : videos.length === 0 ? (
                        <p>No results found.</p>
                    ) : (
                        <div className="list-group">
                            {videos.map(video => (
                                <div
                                    key={video._id}
                                    className="list-group-item list-group-item-action"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => navigate(`/watch/${video._id}`)}
                                >
                                    <div className="row">
                                        <div className="col-md-4">
                                            <img
                                                src={video.thumbnail_url}
                                                alt={video.title}
                                                className="img-fluid rounded"
                                                style={{
                                                    width: "100%",        // takes full width of its container
                                                    height: "180px",      // fixed height for consistency
                                                    objectFit: "cover"    // crops neatly without distortion
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

export default SearchResultsPage;
