import React, { useState, useEffect } from "react";
import axios from "axios";

function ProfilePage() {
    const [user, setUser] = useState(null);

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
            <div className="container mt-5 text-center">
                <h3>Please log in to see your profile.</h3>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="card mx-auto" style={{ maxWidth: "600px" }}>
                <div className="card-body text-center">
                    <img
                        src={user.logo ? user.logo : "profilePicture.png"}
                        alt="Profile"
                        className="rounded-circle mb-3"
                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                    />
                    <h3 className="card-title">{user.channelName}</h3>
                    <p className="text-muted">{user.email}</p>

                    <div className="d-flex justify-content-around mt-4">
                        <div>
                            <h5>{user.subscribers || 0}</h5>
                            <p className="text-muted">Subscribers</p>
                        </div>
                        <div>
                            <h5>{new Date(user.timestamp).toLocaleDateString()}</h5>
                            <p className="text-muted">Joined</p>
                        </div>
                    </div>

                    <button className="btn btn-primary mt-3">Edit Profile</button>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
