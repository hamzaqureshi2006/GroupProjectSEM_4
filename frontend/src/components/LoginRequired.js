import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function LoginRequired() {
    return (
        <div>
            <Navbar />
            <div className="container-fluid">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-2 p-0">
                        <Sidebar />
                    </div>

                    {/* Main Content */}
                    <div
                        className="col-md-10 d-flex justify-content-center align-items-center"
                        style={{ height: "90vh", backgroundColor: "#00000" }}

                    >
                        <div
                            style={{
                                padding: "2rem 3rem",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "16px",
                                background:
                                    "linear-gradient(145deg, rgba(30,30,30,0.95), rgba(20,20,20,0.95))",
                                boxShadow:
                                    "0px 8px 20px rgba(0,0,0,0.6), inset 0px 1px 0px rgba(255,255,255,0.05)",
                                textAlign: "center",
                                maxWidth: "420px",
                                color: "#e0e0e0",
                            }}
                        >
                            <h2
                                style={{
                                    marginBottom: "1rem",
                                    color: "#ffffff",
                                    fontWeight: "600",
                                    fontSize: "1.8rem",
                                }}
                            >
                                Please Login
                            </h2>
                            <p style={{ fontSize: "15px", color: "#bbbbbb", marginBottom: "1.5rem" }}>
                                You need to be logged in to access this page.
                            </p>
                            <a
                                href="/"
                                style={{
                                    display: "inline-block",
                                    padding: "12px 28px",
                                    background: "linear-gradient(90deg, #007bff, #0056d6)",
                                    color: "#fff",
                                    borderRadius: "8px",
                                    textDecoration: "none",
                                    fontWeight: "500",
                                    letterSpacing: "0.5px",
                                    transition: "all 0.3s ease",
                                }}
                                onMouseOver={(e) =>
                                (e.target.style.background =
                                    "linear-gradient(90deg, #0056d6, #003c99)")
                                }
                                onMouseOut={(e) =>
                                (e.target.style.background =
                                    "linear-gradient(90deg, #007bff, #0056d6)")
                                }
                            >
                                Go to Login
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
