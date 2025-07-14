import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './videoWatchPage.css'; // Assuming you have some styles for this page
import Navbar from '../../compoenets/Navbar';
import Sidebar from '../../compoenets/Sidebar';
import axios from 'axios';

/* 
Increase views count  

Increment views in Video collection.

Append video _id to user's watchedVideos if not already present.

Like a video ✅

Toggle like: if already liked, remove like.✅

Dislike a video✅

Toggle dislike: if already disliked, remove dislike.✅

Comment on video ✅

Create a comment document with video_id, user_id, and commentText. ✅

Nested comment (reply to comment)

Like a comment

Future sorting of comments based on likes + timestamp for “Top Comments”.

Subscribe to channel ✅

User can subscribe or unsubscribe to the video uploader’s channel.✅

Save to playlist / Watch later

Allow users to save videos to their custom playlists or watch later.

Share video

Report video or comment

For inappropriate content, add report API to flag videos or comments.

Show recommended videos

Already provided by <video> tag controls, but can be customised for advanced features.

Show video description, tags, upload time, channel name ✅

Toggle immediately on click for responsiveness. ✅

Show number of views✅

Space for pause/play, left-right arrow for seek, up-down arrow for volume.
 */

function VideoWatchPage() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const video_id = queryParams.get("video_id");

    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const [video, setVideo] = useState(null);

    const [uploader, setUploader] = useState(null);

    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/videos/watchVideo/${video_id}`, {
                    withCredentials: true
                });
                setVideo(res.data);
                console.log(res.data);

                setIsLiked(res.data.isLiked);
                setIsDisliked(res.data.isDisliked);
                setIsSubscribed(res.data.isSubscribed);
                setUploader(res.data.user_id);

                const commentsRes = await axios.get(`http://localhost:5000/api/comments/${video_id}`);
                setComments(commentsRes.data);

                setLoading(false);
            } catch (err) {
                console.error("Error fetching video:", err);
                setLoading(false);
            }
        };
        if (video_id) fetchVideo();
    }, [video_id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentInput.trim()) return;

        try {
            const res = await axios.post("http://localhost:5000/api/comments/add", {
                videoId: video_id,
                commentText: commentInput
            }, { withCredentials: true });

            // Add new comment to state
            setComments(prev => [...prev, res.data]);
            setCommentInput("");
        } catch (err) {
            console.error(err);
            alert("Failed to add comment. Please login.");
        }
    };

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

                                {/* Uploader Section */}
                                <div className="d-flex align-items-center justify-content-between mt-2 mb-3">
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={video.user_id.logo || "/profilePicture.png"}
                                            alt="Channel Logo"
                                            style={{ width: "50px", height: "50px", borderRadius: "50%", marginRight: "10px", objectFit: "cover" }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: "bold" }}>{uploader.channelName || "Uploader"}</div>
                                            <small className="text-muted">{uploader.subscribers}</small>
                                        </div>
                                    </div>
                                    <button className={`btn ${isSubscribed ? 'btn-dark' : 'btn-danger'}`}
                                        onClick={() => {
                                            axios.get(`http://localhost:5000/api/users/toggleSubscribe/${uploader._id}`, { withCredentials: true })
                                                .then(res => { setUploader(res.data.targetUser) })
                                                .catch(err => { console.error(err) });
                                            if (uploader._id !== video.user_id._id) {
                                                // Only toggle subscription if the uploader is not the current user
                                                setIsSubscribed(!isSubscribed); // Toggle subscription state
                                            }
                                            else {
                                                alert("You cannot subscribe to your own channel.");
                                            }
                                        }
                                        }
                                    >
                                        Subscribe
                                    </button>
                                </div>

                                {/* Actions Row */}
                                <div className="d-flex align-items-center mb-3" style={{ gap: "10px" }}>
                                    <button className={`btn ${isLiked ? 'btn-success' : 'btn-light'}`} onClick={() => {
                                        axios.post(`http://localhost:5000/api/videos/togglelike/${video_id}`, {}, { withCredentials: true })
                                            .then(res => { console.log(res) })
                                            .catch(err => { console.error(err) });
                                        setIsLiked(!isLiked);//api changes data base and this changes the state to reflect that 
                                    }}>👍 Like</button>
                                    <button className={`btn ${isDisliked ? 'btn-danger' : 'btn-light'}`} onClick={() => {
                                        axios.post(`http://localhost:5000/api/videos/toggledislike/${video_id}`, {}, { withCredentials: true })
                                            .then(res => { console.log(res) })
                                            .catch(err => { console.error(err) });
                                        setIsDisliked(!isDisliked);
                                    }}>👎 Dislike</button>
                                    <button className="btn btn-light">🔗 Share</button>
                                    <button className="btn btn-light">💾 Save</button>
                                </div>

                                {/* Views and Upload Date */}
                                <p>
                                    <small className="text-muted">
                                        {video.views} views • {new Date(video.timestamp).toLocaleDateString()}
                                    </small>
                                </p>

                                {/* Description Box */}
                                <div className="p-3" style={{ backgroundColor: "#f2f2f2", borderRadius: "8px" }}>
                                    <p>{video.description}</p>
                                    <div>
                                        {video.tags && video.tags.map((tag, index) => (
                                            <span key={index} className="badge bg-secondary me-2">{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <h5 className="mt-4">Comments</h5>

                                {/* Comment Input */}
                                <form onSubmit={handleCommentSubmit} className="mb-3">
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Add a comment..."
                                            value={commentInput}
                                            onChange={(e) => setCommentInput(e.target.value)}
                                        />
                                        <button className="p-2 btn btn-primary" type="submit">Comment</button>
                                    </div>
                                </form>

                                {/* Comments List */}
                                <div className='py-4' style={{ maxHeight: "400px", overflowY: "auto" }}>
                                    {comments.map(comment => (
                                        <div key={comment._id} className="d-flex mb-3">
                                            <img
                                                src={comment.user_id.logo || '/profilePicture.png'}
                                                alt={comment.user_id.channelName}
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px', objectFit: "cover" }}
                                            />
                                            <div>
                                                <div className="fw-bold">
                                                    @{comment.user_id.channelName}
                                                    <span className="ms-2 text-muted" style={{ fontSize: '12px' }}>
                                                        {new Date(comment.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div>{comment.commentText}</div>
                                                <div className="d-flex mt-1" style={{ gap: '10px' }}>
                                                    <button className='btn btn-light'>👍 {comment.likes}</button>
                                                    <button className='btn btn-light'>👎 {comment.dislikes}</button>
                                                    <button className='btn btn-light'>Reply</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recommended Videos Sidebar */}
                            <div className="col-md-4">
                                <h5>Recommended Videos</h5>
                                {/* Future: map recommended videos here */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
}

export default VideoWatchPage;
