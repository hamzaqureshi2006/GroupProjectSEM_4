import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

function RecommendedPostsPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommended = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/posts/recommended", {
                    withCredentials: true
                });
                setPosts(res.data.posts);
            } catch (err) {
                console.error("Error fetching recommended posts:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommended();
    }, []);

    return (
        <div className="homepage fade-in">
            <Navbar />
            <div className="content">
                <Sidebar />
                <div className="container mt-4">
                    <h2>Recommended Posts</h2>
                    {loading ? (
                        <div>Loading...</div>
                    ) : posts.length === 0 ? (
                        <div className="text-center mt-5">
                            <h4>No Recommendations Yet</h4>
                            <p className="text-muted">Interact more to get recommendations!</p>
                        </div>
                    ) : (
                        <div className="grid-gap-16 mt-16">
                            {posts.map(post => (
                                <div key={post._id} className="card glass shadow-soft" style={{ padding: 16 }}>
                                    <div className="row">
                                        {post.image_url && (
                                            <div className="col-md-4 mb-2">
                                                <img src={post.image_url} alt={post.title} className="img-fluid rounded" style={{ maxHeight: 180, objectFit: 'cover', width: '100%' }} />
                                            </div>
                                        )}
                                        <div className={post.image_url ? "col-md-8" : "col-md-12"}>
                                            <h5>{post.title}</h5>
                                            <p className="text-muted mb-2">
                                                <span className="badge bg-primary me-2">{post.category}</span>
                                                {new Date(post.timestamp).toLocaleDateString()}
                                            </p>
                                            <p style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</p>
                                            <div className="d-flex align-items-center mt-2">
                                                <span className="me-3">
                                                    <i className="fas fa-eye text-muted me-1"></i>
                                                    {post.views} views
                                                </span>
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RecommendedPostsPage;
