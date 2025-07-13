import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../compoenets/Navbar';
import Sidebar from '../../compoenets/Sidebar';
import axios from 'axios';

function VideoWatchPage() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const video_id = queryParams.get("video_id");

    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState("");

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/videos/getVideo/${video_id}`, {
                    withCredentials: true
                });
                setVideo(res.data);

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
                                <div className="embed-responsive embed-responsive-16by9">
                                    <video
                                        controls
                                        src={`${video.video_url}`}
                                        className="embed-responsive-item"
                                        style={{ width: "100%" }}
                                    />
                                </div>
                                <h3 className="mt-3">{video.title}</h3>
                                <p>{video.description}</p>
                                <p>
                                    <small className="text-muted">
                                        {video.views} views • {new Date(video.timestamp).toLocaleDateString()}
                                    </small>
                                </p>
                                <div>
                                    {video.tags && video.tags.map((tag, index) => (
                                        <span key={index} className="badge bg-secondary me-2">{tag}</span>
                                    ))}
                                </div>



                                {/* This is Comment Section */}

                                <h4>Comments</h4>

                                <form onSubmit={handleCommentSubmit} className="mb-3">
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Add a comment..."
                                            value={commentInput}
                                            onChange={(e) => setCommentInput(e.target.value)}
                                        />
                                        <button className="btn btn-primary" type="submit">Comment</button>
                                    </div>
                                </form>

                                <ul className="list-group">
                                    {comments.map(comment => (
                                        <div key={comment._id} style={{ display: 'flex', marginBottom: '15px' }}>
                                            <img
                                                src={comment.user_id.logo || 'profilePicture.png'}
                                                alt={comment.user_id.channelName}
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>
                                                    @{comment.user_id.channelName}
                                                    <span style={{ marginLeft: '5px', color: 'gray', fontSize: '12px' }}>
                                                        {new Date(comment.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div>{comment.commentText}</div>
                                                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                                    <button className='btn btn-success'>👍 {comment.likes}</button>
                                                    <button className='btn btn-danger'>👎 {comment.dislikes}</button>
                                                    <button className='btn btn-info'>Reply</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </ul>

                                {/* End of Comment Section */}


                            </div>

                            <div className="col-md-4">
                                <h5>Recommended Videos</h5>
                                {/* Optionally render recommendations here */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VideoWatchPage;
