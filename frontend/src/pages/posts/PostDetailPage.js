import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import './PostDetailPage.css';

function PostDetailPage() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/users/me", { withCredentials: true });
                setCurrentUser(res.data);
            } catch (err) {
                console.error("Failed to fetch current user", err);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/posts/${id}`);
                setPost(res.data.post);
            } catch (err) {
                console.error("Error fetching post:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    const handleLike = async () => {
        if (!currentUser) return alert('Login to like posts!');
        try {
            const res = await axios.post(`http://localhost:5000/api/posts/togglelike/${id}`, {}, { withCredentials: true });
            const { likes, dislikes, isLiked, isDisliked } = res.data;
            setPost({ ...post, likes, dislikes, isLiked, isDisliked });
        } catch (err) {
            alert('Failed to like post');
        }
    };

    const handleDislike = async () => {
        if (!currentUser) return alert('Login to dislike posts!');
        try {
            const res = await axios.post(`http://localhost:5000/api/posts/toggledislike/${id}`, {}, { withCredentials: true });
            const { likes, dislikes, isLiked, isDisliked } = res.data;
            setPost({ ...post, likes, dislikes, isLiked, isDisliked });
        } catch (err) {
            alert('Failed to dislike post');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!post) return <div>Post not found</div>;

    return (
        <>
            <Navbar />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-2 p-0">
                        <Sidebar />
                    </div>
                    <div className="col-md-10 mt-3">
                        <div className="row">
                            <div className="col-md-8">
                                <img src={post.image_url} alt={post.title} className="img-fluid rounded" />
                                <h1 className="mt-3">{post.title}</h1>
                                <p className="text-muted">{post.category} - {new Date(post.timestamp).toLocaleDateString()}</p>
                                <div className="d-flex align-items-center mt-2 post-actions">
                                    <button className={`btn btn-light me-2 ${post.isLiked ? 'active-like' : ''}`} onClick={handleLike}>
                                        👍 {post.likes}
                                    </button>
                                    <button className={`btn btn-light me-2 ${post.isDisliked ? 'active-dislike' : ''}`} onClick={handleDislike}>
                                        👎 {post.dislikes}
                                    </button>
                                    <span className="me-3">
                                        <i className="fas fa-eye text-muted me-1"></i>
                                        {post.views} views
                                    </span>
                                </div>
                                <hr />
                                <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
                            </div>
                            <div className="col-md-4">
                                {/* Recommended Posts Sidebar */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PostDetailPage;
