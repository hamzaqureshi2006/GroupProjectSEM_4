import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import "./NewsPage.css";

export default function NewsPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNews() {
            try {
                const res = await axios.get("http://localhost:5000/api/news"); // Express endpoint
                setArticles(res.data.articles || []);
            } catch (error) {
                console.error("Error fetching news:", error);
            }
            setLoading(false);
        }
        fetchNews();
    }, []);

    if (loading) return (
        <div className="news-page">
            <Navbar />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-2 p-0 sidebar-col">
                        <Sidebar />
                    </div>
                    <div className="col-md-10 p-0">
                        <div className="news-header">
                            <h1 className="news-title">Latest News</h1>
                        </div>
                        <div className="news-grid">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="news-card">
                                    <div className="skeleton skeleton-image" />
                                    <div className="news-content">
                                        <div className="skeleton skeleton-title" style={{ width: "80%" }} />
                                        <div className="skeleton skeleton-text" style={{ width: "100%" }} />
                                        <div className="skeleton skeleton-text" style={{ width: "60%" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="news-page">
            <Navbar />
            <div className="container-fluid">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-2 p-0 sidebar-col">
                        <Sidebar />
                    </div>
                    <div className="col-md-10 p-0">
                        <div className="news-header">
                            <h1 className="news-title">Latest News</h1>
                        </div>
                        {(!articles || articles.length === 0) ? (
                            <div className="empty-state">No articles found. Please try again later.</div>
                        ) : (
                            <div className="news-grid">
                                {articles.map((article, idx) => (
                                    <div key={idx} className="news-card">
                                        {article.urlToImage ? (
                                            <img className="news-image" src={article.urlToImage} alt={article.title} />
                                        ) : (
                                            <div className="news-image" />
                                        )}
                                        <div className="news-content">
                                            <div className="news-source">{article.source?.name || "News"}</div>
                                            <h2 className="news-card-title">{article.title}</h2>
                                            {article.description && (
                                                <p className="news-description">{article.description}</p>
                                            )}
                                            <div className="news-card-footer">
                                                <Link to={`/news/read?url=${encodeURIComponent(article.url)}`}>
                                                    <button className="read-btn">Read Article</button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
