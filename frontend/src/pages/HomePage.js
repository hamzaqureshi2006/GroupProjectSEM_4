import React from "react";
import Navbar from "../compoenets/Navbar";
import Sidebar from "../compoenets/Sidebar";

function HomePage() {


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
        <div className="homepage fade-in">
            <Navbar />
            <div className="content">
                <Sidebar />
                <div className="col-md-10 p-5">
                    <div className="row">
                        {videos.map(video => (
                            <div key={video.id} className="col-md-4 mb-4">
                                <div className="card">
                                    <div className="skeleton skeleton-thumb" />
                                    <div className="card-body">
                                        <div className="skeleton skeleton-text" style={{ width: "75%" }} />
                                        <div className="skeleton skeleton-text" style={{ width: "40%" }} />
                                        <button className="btn-gradient btn-block" style={{ marginTop: 12 }}>Watch</button>
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
