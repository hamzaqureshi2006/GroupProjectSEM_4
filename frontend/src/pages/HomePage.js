import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../compoenets/Navbar";
import "./HomePage.css";

function HomePage() {
    const navigate = useNavigate();

    // Dummy video data
    const videos = Array.from({ length: 9 }, (_, i) => ({
        id: i + 1,
        title: `Video Title ${i + 1}`,
        creator: `Creator ${i + 1}`,
        views: Math.floor(Math.random() * 1000),
        time: `${Math.floor(Math.random() * 60)} minutes ago`,
        thumbnail: "https://dummyimage.com/300x180/eee/aaa"
    }));

    return (
        <div className="homepage">
            {/* Navbar */}
            <Navbar />

            <div className="content">
                {/* Sidebar */}
                <aside className="sidebar bg-light p-3" style={{ minHeight: "100vh", borderRight: "1px solid #dee2e6" }}>
                    <ul className="list-unstyled">
                        <li className="mb-3 sidebar-item" onClick={() => navigate("/")}>Home</li>
                        <li className="mb-3 sidebar-item" onClick={() => navigate("/liked")}>Liked Videos</li>
                        <li className="mb-3 sidebar-item" onClick={() => navigate("/subscribedChannels")}>Subscribed Channels</li>
                        <li className="mb-3 sidebar-item" onClick={() => navigate("/watchHistory")}>Watch History</li>
                        <li className="mb-3 sidebar-item" onClick={() => navigate("/news")}>News</li>
                    </ul>
                </aside>


                {/* Video Feed */}
                <div className="col-md-10 p-5">
                    <div className="row">
                        {videos.map(video => (
                            <div key={video.id} className="col-md-4 mb-4">
                                <div className="card">
                                    <img
                                        src={video.thumbnail}
                                        className="card-img-top"
                                        alt={video.title}
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title">{video.title}</h5>
                                        <p className="card-text">{video.creator}</p>
                                        <p className="card-text">{video.views} views</p>
                                        <p className="card-text">{video.time}</p>
                                        <button className="btn btn-primary w-100">Watch</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
