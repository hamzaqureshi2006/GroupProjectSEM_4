import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './videoWatchPage.css';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import RecommendedVideos from '../../components/RecommendedVideos';
import axios from 'axios';
import LoginRequired from '../../components/LoginRequired';

function VideoWatchPage() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const video_id = queryParams.get("video_id");

    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [video, setVideo] = useState(null);
    const [uploader, setUploader] = useState({});
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState("");
    const [loading, setLoading] = useState(true);
    //   const [user, setUser] = useState(null);  // Add user state
    const [currentUser, setCurrentUser] = useState(null);
    const [likeAnimating, setLikeAnimating] = useState(false);

    const likeLayerRef = useRef(null);

    const triggerLikeBlast = () => {
        const layer = likeLayerRef.current;
        if (!layer) return;
        const count = 26;
        const confetti = ['🎉', '✨', '🎊', '💫', '⭐', '🔥'];

        const ring = document.createElement('div');
        ring.className = 'blast-ring';
        layer.appendChild(ring);

        for (let i = 0; i < count; i += 1) {
            const el = document.createElement('span');
            el.className = 'blast-particle';
            const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.6 - 0.3);
            const distance = 70 + Math.random() * 60; // farther
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            el.style.setProperty('--tx', `${dx}px`);
            el.style.setProperty('--ty', `${dy}px`);
            el.style.setProperty('--rot', `${Math.floor(Math.random() * 360) - 180}deg`);
            el.textContent = confetti[Math.floor(Math.random() * confetti.length)];
            // Vary duration slightly for natural look
            const dur = 750 + Math.floor(Math.random() * 300);
            el.style.animationDuration = `${dur}ms`;
            layer.appendChild(el);
        }

        setTimeout(() => {
            while (layer.firstChild) layer.removeChild(layer.firstChild);
        }, 1200);
    };

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
        const fetchVideoAndComments = async () => {
            try {
                const videoRes = await axios.get(
                    `http://localhost:5000/api/videos/watchVideo/${video_id}`,
                    { withCredentials: true }
                );
                setVideo(videoRes.data);
                setIsLiked(videoRes.data.isLiked);
                setIsDisliked(videoRes.data.isDisliked);
                setIsSubscribed(videoRes.data.isSubscribed);
                setUploader(videoRes.data.user_id);

                const commentsRes = await axios.get(
                    `http://localhost:8000/api/comments/list/?video_id=${video_id}`
                );
                setComments(commentsRes.data);

                setLoading(false);
            } catch (err) {
                console.error("Error fetching video or comments:", err);
                setLoading(false);
            }
        };

        if (video_id) fetchVideoAndComments();
    }, [video_id, currentUser]);

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
                    video_id: video_id,
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
    if (currentUser === null) return <LoginRequired />
    if (loading) return <div>Loading...</div>;
    if (!video) return <div>Video not found</div>;

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
                                {/* Video Player */}
                                <div className="embed-responsive embed-responsive-16by9">
                                    <video
                                        controls
                                        src={video.video_url}
                                        className="embed-responsive-item"
                                        style={{ width: "100%", borderRadius: "10px" }}
                                    />
                                </div>
                                {/* Video Title */}
                                <h4 className="mt-3 fw-bold">{video.title}</h4>
                                {/* Video Actions */}
                                <div className="video-actions d-flex align-items-center mb-2">
                                    <div className="like-blast-wrapper">
                                        <div className="like-blast-layer" ref={likeLayerRef} />
                                        <button
                                            className={`btn btn-light me-2 btn-like ${isLiked ? 'active-like' : ''} ${likeAnimating ? 'celebrate' : ''}`}
                                            onClick={async () => {
                                                if (!currentUser?._id) return alert('Login to like videos!');
                                                try {
                                                    const res = await axios.post(`http://localhost:5000/api/videos/togglelike/${video._id}`, {}, { withCredentials: true });
                                                    const data = res.data;
                                                    setIsLiked(data.isLiked);
                                                    setIsDisliked(data.isDisliked);
                                                    if (data.isLiked) {
                                                        setLikeAnimating(false);
                                                        requestAnimationFrame(() => {
                                                            setLikeAnimating(true);
                                                            triggerLikeBlast();
                                                            setTimeout(() => setLikeAnimating(false), 450);
                                                        });
                                                    } else {
                                                        setLikeAnimating(false);
                                                    }
                                                } catch (err) {
                                                    alert('Failed to like video');
                                                }
                                            }}
                                            aria-pressed={isLiked}
                                        >
                                            {isLiked ? '👍 Liked' : '👍 Like'}
                                        </button>
                                    </div>
                                    <button
                                        className={`btn btn-light me-2 ${isDisliked ? 'active-dislike' : ''}`}
                                        onClick={async () => {
                                            if (!currentUser?._id) return alert('Login to dislike videos!');
                                            try {
                                                const res = await axios.post(`http://localhost:5000/api/videos/toggledislike/${video._id}`, {}, { withCredentials: true });
                                                const data = res.data;
                                                setIsLiked(data.isLiked);
                                                setIsDisliked(data.isDisliked);
                                                setLikeAnimating(false);
                                            } catch (err) {
                                                alert('Failed to dislike video');
                                            }
                                        }}
                                    >
                                        👎 Dislike
                                    </button>
                                </div>
                                {/* Uploader Section */}
                                <div className="d-flex align-items-center justify-content-between mt-2 mb-3">
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={video.user_id?.logo || "/profilePicture.png"}
                                            alt="Channel Logo"
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                borderRadius: "50%",
                                                marginRight: "10px",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: "bold" }}>{uploader.channelName || "Uploader"}</div>
                                            <small className="text-muted">{uploader.subscribers}</small>
                                        </div>
                                    </div>
                                    <button
                                        className={`${isSubscribed ? "btn-unsubscribe" : "btn-subscribe"}`}
                                        onClick={async () => {
                                            if (!currentUser?._id) return alert('Login to subscribe!');
                                            try {
                                                await axios.get(`http://localhost:5000/api/users/toggleSubscribe/${uploader._id}`, { withCredentials: true });
                                                setIsSubscribed((prev) => !prev);
                                                // Update local subscriber count to avoid reload
                                                setUploader((prev) => ({
                                                    ...prev,
                                                    subscribers: Math.max(0, (prev.subscribers || 0) + (isSubscribed ? -1 : 1))
                                                }));
                                            } catch (err) {
                                                alert('Failed to subscribe/unsubscribe');
                                            }
                                        }}
                                    >
                                        {isSubscribed ? "Unsubscribe" : "Subscribe"}
                                    </button>
                                </div>
                                {/* Comments Section */}
                                <h5 className="mt-4">Comments</h5>
                                {/* Comment Input */}
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
                                {/* Comments List */}
                                <div className="py-4" style={{ maxHeight: "400px", overflowY: "auto" }}>
                                    {comments.map((comment, idx) => (
                                        <div>
                                            <div
                                                key={comment._id || idx}
                                                className="d-flex mb-3"
                                                style={{ position: "relative" }}
                                            >
                                                <img
                                                    src={comment?.user?.logo || "/profilePicture.png"}
                                                    alt={comment?.user?.channelName || "User"}
                                                    style={{
                                                        width: "40px",
                                                        height: "40px",
                                                        borderRadius: "50%",
                                                        marginRight: "20px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                                <div style={{ position: "relative" }}>
                                                    <div className="fw-bold" style={{ position: "relative" }}>
                                                        {comment?.user?.channelName || "Deleted User"}
                                                        <span className="ms-2 text-muted" style={{ fontSize: "12px", marginRight: "100px" }}>
                                                            {comment.timestamp ? new Date(comment.timestamp).toLocaleDateString() : ""}
                                                        </span>
                                                        {comment.is_spam && (
                                                            <span
                                                                style={{
                                                                    position: "relative",
                                                                    top: 0,
                                                                    right: 0,
                                                                    background: "red",
                                                                    color: "white",
                                                                    borderRadius: "8px",
                                                                    padding: "2px 8px",
                                                                    fontSize: "10px",
                                                                    fontWeight: "bold",
                                                                    marginLeft: "5px",
                                                                    zIndex: 2,
                                                                }}
                                                            >
                                                                SPAM
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>{comment.commentText}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Recommended Videos Sidebar */}
                            <div className="col-md-4">
                                <RecommendedVideos videoId={video_id} currentVideoTitle={video?.title} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VideoWatchPage;
