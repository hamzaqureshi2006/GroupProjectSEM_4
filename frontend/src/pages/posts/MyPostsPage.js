import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import axios from "axios";

// This page displays the posts uploaded by the authenticated user
function MyPostsPage() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyPosts = async () => {
            try {
                // Get current user's posts
                const res = await axios.get("http://localhost:5000/api/posts/user/me", { 
                    withCredentials: true 
                });
                setPosts(res.data.posts);
            } catch (err) {
                console.error("Error fetching my posts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyPosts();
    }, []);

    const handleDeletePost = async (postId) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
                    withCredentials: true
                });
                setPosts(posts.filter(post => post._id !== postId));
                alert("Post deleted successfully!");
            } catch (err) {
                console.error("Error deleting post:", err);
                alert("Failed to delete post");
            }
        }
    };

    return (
        <div className="homepage fade-in">
            <Navbar />
            <div className="content">
                <Sidebar />
                <div className="container mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>My Posts</h2>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate("/upload-post")}
                        >
                            <i className="fas fa-plus me-2"></i>
                            Create New Post
                        </button>
                    </div>
                    
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
                            <h4>No Posts Yet</h4>
                            <p className="text-muted">Start sharing your thoughts by creating your first post!</p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate("/upload-post")}
                            >
                                Create Your First Post
                            </button>
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
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h5 className="mb-0">{post.title}</h5>
                                                <div className="dropdown">
                                                    <button 
                                                        className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                                        type="button" 
                                                        data-bs-toggle="dropdown"
                                                    >
                                                        <i className="fas fa-ellipsis-v"></i>
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li>
                                                            <button 
                                                                className="dropdown-item"
                                                                onClick={() => navigate(`/edit-post/${post._id}`)}
                                                            >
                                                                <i className="fas fa-edit me-2"></i>Edit
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button 
                                                                className="dropdown-item text-danger"
                                                                onClick={() => handleDeletePost(post._id)}
                                                            >
                                                                <i className="fas fa-trash me-2"></i>Delete
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <p className="text-muted mb-2">
                                                <span className="badge bg-primary me-2">{post.category}</span>
                                                {new Date(post.timestamp).toLocaleDateString()}
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
                                                <div className="d-flex align-items-center">
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyPostsPage;
