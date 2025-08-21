import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import axios from "axios";

function LikedPostsPage() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikedPosts = async () => {
            try {
                // Test route first
                const testRes = await axios.get("http://localhost:5000/api/posts/test-liked", { 
                    withCredentials: true 
                });
                console.log("Test route works:", testRes.data);
                
                // Now try the actual route
                const res = await axios.get("http://localhost:5000/api/posts/likedPosts", { 
                    withCredentials: true 
                });
                setPosts(res.data);
            } catch (err) {
                console.error("Error fetching liked posts:", err);
                console.error("Error response:", err.response?.data);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedPosts();
    }, []);

    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
    };

    return (
        <div className="homepage fade-in">
            <Navbar />
            <div className="content">
                <Sidebar />
                <div className="container mt-4">
                    <h2>Liked Posts</h2>
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
                    ) : posts.length === 0 ? (
                        <div className="text-center mt-5">
                            <h4>No Liked Posts Yet</h4>
                            <p className="text-muted">Like some posts to see them here!</p>
                        </div>
                    ) : (
                        <div className="grid-gap-16 mt-16">
                            {posts.map(post => (
                                <div 
                                    key={post._id} 
                                    className="card glass shadow-soft clickable-card" 
                                    style={{ padding: 16, cursor: 'pointer' }}
                                    onClick={() => handlePostClick(post._id)}
                                >
                                    <div className="row">
                                        {post.image_url && (
                                            <div className="col-md-4 mb-2">
                                                <img 
                                                    src={post.image_url} 
                                                    alt={post.title} 
                                                    className="img-fluid rounded" 
                                                    style={{ maxHeight: 180, objectFit: 'cover', width: '100%' }} 
                                                />
                                            </div>
                                        )}
                                        <div className={post.image_url ? "col-md-8" : "col-md-12"}>
                                            <h5>{post.title}</h5>
                                            <p className="text-muted mb-2">
                                                <span className="badge bg-primary me-2">{post.category}</span>
                                                By {post.user_id?.channelName || post.user_id?.username || 'Unknown'} • {new Date(post.timestamp).toLocaleDateString()}
                                            </p>
                                            <p style={{ 
                                                display: '-webkit-box', 
                                                WebkitLineClamp: 3, 
                                                WebkitBoxOrient: 'vertical', 
                                                overflow: 'hidden' 
                                            }}>
                                                {post.content}
                                            </p>
                                            <div className="d-flex align-items-center mt-2">
                                                <span className="me-3">
                                                    <i className="fas fa-eye text-muted me-1"></i>
                                                    {post.views} views
                                                </span>
                                                <span className="me-3">
                                                    <i className="fas fa-heart text-danger me-1"></i>
                                                    {post.likes} likes
                                                </span>
                                                <span className="me-3">
                                                    <i className="fas fa-thumbs-down text-muted me-1"></i>
                                                    {post.dislikes} dislikes
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LikedPostsPage;
