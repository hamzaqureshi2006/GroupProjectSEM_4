import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../compoenets/Navbar";
import Sidebar from "../../compoenets/Sidebar";

function RegisterPage() {
    const [channelName, setChannelName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [logo, setLogo] = useState(null);
    const [banner, setBanner] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("channelName", channelName);
        formData.append("email", email);
        formData.append("password", password);
        if (logo) formData.append("logo", logo);
        if (banner) formData.append("banner", banner);

        try {
            const res = await axios.post("http://localhost:5000/api/users/register", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log(res);
            alert("Registration successful!");
            navigate("/login"); // redirect to login page after registration
        } catch (err) {
            console.error(err);
            alert("Registration failed. Please check your inputs.");
        }
    };

    return (
        <div className="homepage fade-in">
            <Navbar />
            <div className="content">
                <Sidebar />
                <div className="container mt-5" style={{ maxWidth: "400px" }}>
                    <h2 className="mb-4">Register</h2>
                    <form onSubmit={handleRegister}>
                <div className="mb-3">
                    <label>channelName</label>
                    <input
                        type="text"
                        className="form-control"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label>Email address</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label>Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label>Profile Logo</label>
                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => setLogo(e.target.files[0])}
                    />
                </div>

                <div className="mb-3">
                    <label>Channel Banner</label>
                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => setBanner(e.target.files[0])}
                    />
                </div>

                        <button type="submit" className="btn btn-primary w-100">
                            Register
                        </button>
                    </form>

                    <div className="mt-3 text-center">
                        <p>Already have an account?</p>
                        <Link to="/login" className="btn btn-secondary">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
