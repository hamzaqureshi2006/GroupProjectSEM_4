import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import './PostDetailPage.css';
import LoginRequired from '../../components/LoginRequired';

function PostDetailPage() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState("");


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/users/me", { withCredentials: true });
                setCurrentUser(res.data);
            } catch (err) {
                console.error("Failed to fetch current user", err);
                setCurrentUser(null)
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchPostAndComments = async () => {
            try {
                const postRes = await axios.get(`http://localhost:5000/api/posts/${id}`);
                setPost(postRes.data.post);

                const commentsRes = await axios.get(`http://localhost:8000/api/comments/list/?post_id=${id}`);
                setComments(commentsRes.data);

            } catch (err) {
                console.error("Error fetching post or comments:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPostAndComments();
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

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentInput.trim()) return;
        if (!currentUser?._id) {
            alert("You must be logged in to comment.");
            return;
        }

        try {
            const res = await axios.post(
                "http://localhost:8000/api/comments/create/",
                {
                    commentText: commentInput,
                    post_id: id,
                    user_id: currentUser._id,
                }
            );
            setComments((prev) => [...prev, res.data]);
            setCommentInput("");
        } catch (err) {
            console.error("Failed to add comment:", err);
            alert("Failed to add comment.");
        }
    };
    if (!currentUser) return <LoginRequired />

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

                                {/* Comments Section */}
                                <h5 className="mt-4">Comments</h5>
                                <form onSubmit={handleCommentSubmit} className="mb-3">
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder={currentUser ? "Add a comment..." : "Login to comment"}
                                            value={commentInput}
                                            onChange={(e) => setCommentInput(e.target.value)}
                                            disabled={!currentUser}
                                        />
                                        <button className="p-2 btn btn-primary" type="submit" disabled={!currentUser}>
                                            Comment
                                        </button>
                                    </div>
                                </form>

                                <div className="py-4" style={{ maxHeight: "400px", overflowY: "auto" }}>
                                    {comments.map((comment, idx) => (
                                        <div key={comment._id || idx} className="d-flex mb-3">
                                            <img
                                                src={comment?.user?.logo || "/profilePicture.png"}
                                                alt={comment?.user?.channelName || "User"}
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    borderRadius: "50%",
                                                    marginRight: "10px",
                                                    objectFit: "cover",
                                                }}
                                            />
                                            <div style={{ position: "relative", width: '100%' }}>
                                                <div className="fw-bold">
                                                    {comment?.user?.channelName || "Anonymous User"}
                                                    <span className="ms-2 text-muted" style={{ fontSize: "12px", marginRight: "20px" }}>
                                                        {comment.timestamp ? new Date(comment.timestamp).toLocaleDateString() : ""}
                                                    </span>
                                                    {comment.is_spam && (
                                                        <span
                                                            style={{
                                                                display: 'inline-block',
                                                                background: "red",
                                                                color: "white",
                                                                borderRadius: "8px",
                                                                padding: "2px 8px",
                                                                fontSize: "10px",
                                                                fontWeight: "bold",
                                                            }}
                                                        >
                                                            SPAM
                                                        </span>
                                                    )}
                                                </div>
                                                <div>{comment.commentText}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
