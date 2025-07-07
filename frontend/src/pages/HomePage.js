import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
    const navigate = useNavigate();

    // Dummy video data
    const videos = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Video Title ${i + 1}`,
        creator: `Creator ${i + 1}`,
        views: Math.floor(Math.random() * 1000),
        thumbnail: "https://via.placeholder.com/300x180"
    }));

    return (
        <div className="homepage">
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-brand">MySocialMedia</div>
                <div className="navbar-search">
                    <input type="text" placeholder="Search" />
                    <button>Search</button>
                </div>
                <div className="navbar-actions">
                    <button>Upload Video</button>
                    <button>Login</button>
                </div>
            </nav>

            <div className="content">
                {/* Sidebar */}
                <aside className="sidebar">
                    <ul>
                        <li onClick={() => navigate("/")}>Home</li>
                        <li onClick={() => navigate("/liked")}>Liked Videos</li>
                        <li>Subscribed Channels</li>
                        <li>Watch History</li>
                        <li>Trending</li>
                        <li>News</li>
                    </ul>
                </aside>

                {/* Video Feed */}
                <main className="video-feed">
                    {videos.map(video => (
                        <div key={video.id} className="video-card">
                            <img src={video.thumbnail} alt={video.title} />
                            <h3>{video.title}</h3>
                            <p>{video.creator}</p>
                            <p>{video.views} views</p>
                            <button>Watch</button>
                        </div>
                    ))}
                </main>
            </div>
        </div>
    );
}

export default HomePage;
