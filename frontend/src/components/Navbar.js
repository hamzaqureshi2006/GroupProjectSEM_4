import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Navbar() {
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
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
                setUser(null); // not logged in
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:5000/api/users/logout", {}, { withCredentials: true });
            setUser(null);
            navigate("/login");
        } catch (err) {
            console.error(err);
            alert("Logout failed");
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">TrueSphere</div>

            <div className="navbar-search">
                <input 
                    type="text" 
                    placeholder="Search videos." 
                    onChange={(e) => { setSearchQuery(e.target.value) }} 
                />
                <button 
                    className="btn btn-primary m-3"
                    onClick={() => navigate(`/search?search_query=${searchQuery}`)}
                >
                    Search
                </button>
            </div>

            <div className="navbar-actions">
                <button className="btn btn-primary" onClick={() => navigate("/upload")}>Upload Video</button>

                {user ? (
                                    <div className="dropdown" style={{ position: "relative" }}>
                    <img
                        src={user.logo ? user.logo : "profilePicture.png"}
                        alt="Profile"
                        className="profile-logo"
                        onClick={() => document.getElementById("profileDropdown").classList.toggle("show")}
                    />

                        <div id="profileDropdown" className="dropdown-content">
                            <button onClick={() => navigate(`/channel/${user._id}`)}>My Channel</button>
                            <button onClick={() => navigate("/profile")}>Profile</button>
                            <button onClick={() => navigate("/settings")}>Settings</button>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                ) : (
                    <button className="btn btn-primary" onClick={() => navigate("/login")}>Login/Register</button>
                )}
            </div>

            {/* Dropdown CSS */}
            <style>{`
      .dropdown-content {
        display: none;
        position: absolute;
        top: 50px; /* below the image */
        right: 0;
        background-color: white;
        box-shadow: 0px 8px 16px rgba(0,0,0,0.2);
        z-index: 1;
      }
      .dropdown-content button {
        padding: 10px;
        width: 100%;
        text-align: left;
        border: none;
        background: none;
        cursor: pointer;
      }
      .dropdown-content button:hover {
        background-color: #f2f2f2;
      }
      .show {
        display: block;
      }
    `}</style>
        </nav>
    );

}

export default Navbar;

