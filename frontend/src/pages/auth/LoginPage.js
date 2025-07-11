import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:5000/api/users/login", {
                email,
                password,
            },
                { withCredentials: true }
            );
            console.log(res);

            alert("Login successful!");
            navigate("/"); // redirect to homepage after login
        } catch (err) {
            console.error(err);
            alert("Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "400px" }}>
            <h2 className="mb-4">Login</h2>
            <form onSubmit={handleLogin}>
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

                <button type="submit" className="btn btn-primary w-100">
                    Login
                </button>
            </form>

            <div className="mt-3 text-center">
                <p>Don't have an account?</p>
                <Link to="/register" className="btn btn-secondary">
                    Register
                </Link>
            </div>
        </div>
    );
}

export default LoginPage;
