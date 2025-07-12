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

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/videos/getVideo/${video_id}`, {
                    withCredentials: true
                });
                setVideo(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching video:", err);
                setLoading(false);
            }
        };
        if (video_id) fetchVideo();
    }, [video_id]);

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
