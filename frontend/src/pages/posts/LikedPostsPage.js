import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import axios from "axios";

// This page displays the liked posts of the user
function LikedPostsPage() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikedPosts = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/posts/likedPosts", { 
                    withCredentials: true 
                });
                setPosts(res.data.posts);
            } catch (err) {
                console.error("Error fetching liked posts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedPosts();
    }, []);

    return (
        <div className="homepage fade-in">
            <Navbar />
            <div className="content">
                <Sidebar />
                <div className="container mt-4">
                    <h2 className="mb-4">Liked Posts</h2>
                    
                    {loading ? (
                        <div className="grid-gap-16 mt-16">
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <div key={idx} className="card glass shadow-soft">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="skeleton skeleton-text" style={{ width: "60%" }} />
                                            <div className="skeleton skeleton-text" style={{ width: "40%" }} />
                                            <div className="skeleton skeleton-text" style={{ width: "30%" }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center mt-5">
                            <h4>No Liked Posts Yet</h4>
                            <p className="text-muted">Posts you like will appear here</p>
                        </div>
                    ) : (
                        <div className="grid-gap-16 mt-16">
                            {posts.map(post => (
                                <div key={post._id} className="card glass shadow-soft" style={{ cursor: "pointer", padding: 16 }}>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <h5 className="mb-2">{post.title}</h5>
                                            <p className="text-muted mb-2">
                                                <span className="badge bg-primary me-2">{post.category}</span>
                                                by {post.user_id?.username || 'Unknown User'}
                                            </p>
                                            <p className="mb-3" style={{ 
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {post.content}
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">
                                                    {post.views} views • {new Date(post.timestamp).toLocaleDateString()}
                                                </small>
                                                <div className="d-flex align-items-center">
                                                    <span className="me-3">
                                                        <i className="fas fa-heart text-danger me-1"></i>
                                                        {post.likes}
                                                    </span>
                                                    {post.tags && post.tags.length > 0 && (
                                                        <div>
                                                            {post.tags.slice(0, 3).map((tag, idx) => (
                                                                <span key={idx} className="badge bg-secondary me-1">{tag}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
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

export default LikedPostsPage;
