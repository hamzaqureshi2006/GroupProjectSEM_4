import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import HomepageRecommendedVideos from "../components/HomepageRecommendedVideos";

function HomePage() {
    return (
        <div className="homepage fade-in">
            <Navbar />
            <div className="content">
                <Sidebar />
                <div className="col-md-10 p-5">
                    {/* Recommended Videos Section */}
                    <HomepageRecommendedVideos />

                    {/* Other Content */}
                    {/* <div className="row">
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
                    </div> */}
                </div>
            </div>
        </div>
    );
}

export default HomePage;
