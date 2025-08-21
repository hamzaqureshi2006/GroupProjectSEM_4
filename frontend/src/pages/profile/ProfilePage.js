import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { useNavigate } from "react-router-dom";

function ProfilePage() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/users/me", {
                    withCredentials: true,
                });
                console.log("User data fetched:", res.data);
                setUser(res.data);
            } catch (err) {
                console.error("Error fetching user:", err);
                setUser(null); // not logged in
            }
        };

        fetchUser();
    }, []);

    if (!user) {
        return (
            <div className="homepage fade-in">
                <Navbar />
                <div className="content">
                    <Sidebar />
                    <div className="container mt-5 text-center">
                        <h3>Please log in to see your profile.</h3>
                    </div>
                </div>
            </div>
        );
    }

    const joinDate = new Date(user.timestamp).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="homepage fade-in">
            <Navbar />
            <div className="content">
                <Sidebar />
                <div className="container mt-4">
                    <div className="card mx-auto shadow-sm" style={{ maxWidth: "800px", border: 'none', borderRadius: '15px', overflow: 'hidden' }}>
                        <div style={{ height: '200px', background: `url(${user.banner || '/default-banner.jpg'}) center center / cover no-repeat` }} />
                        <div className="card-body text-center" style={{ marginTop: '-75px' }}>
                            <img
                                src={user.logo || "/profilePicture.png"}
                                alt="Profile"
                                className="rounded-circle mb-3 shadow"
                                style={{ width: "150px", height: "150px", objectFit: "cover", border: '4px solid white' }}
                            />
                            <h3 className="card-title fw-bold" style={{ color: '#A9A9A9' }}>{user.channelName}</h3>
                            <p className="text-secondary">{user.email}</p>

                            <div className="d-flex justify-content-center mt-4 text-center">
                                <div className="px-4">
                                    <h5 className="fw-bold" style={{ color: '#A9A9A9' }}>{user.subscribers || 0}</h5>
                                    <p className="text-secondary">Subscribers</p>
                                </div>
                                <div className="px-4">
                                    <h5 className="fw-bold" style={{ color: '#A9A9A9' }}>{joinDate}</h5>
                                    <p className="text-secondary">Joined</p>
                                </div>
                            </div>

                            <button className="btn btn-primary mt-4 px-4 py-2" onClick={() => navigate('/edit-profile')}>Edit Profile</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
