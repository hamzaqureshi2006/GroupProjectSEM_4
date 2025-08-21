import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import "./ReadArticlePage.css";

export default function ReadArticlePage() {
  const { search } = useLocation();
  const url = new URLSearchParams(search).get("url");

  const [fullText, setFullText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await axios.post("http://localhost:8000/api/extract_text/", { url });
        setFullText(res.data.text);
      } catch (error) {
        console.error("Error fetching article text:", error);
      }
      setLoading(false);
    }
    fetchArticle();
  }, [url]);

  async function handleSummarize() {
    setSummarizing(true);
    try {
      const res = await axios.post("http://localhost:8000/api/summarize/", { url });
      setSummary(res.data.summary);
    } catch (error) {
      console.error("Error summarizing article:", error);
    }
    setSummarizing(false);
  }

  if (loading) return (
    <div className="reader-page">
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-2 p-0 sidebar-col">
            <Sidebar />
          </div>
          <div className="col-md-10 p-0">
            <div className="reader-container">
              <div className="reader-header">
                <h1 className="reader-title">Loading article...</h1>
              </div>
              <div className="reader-card">
                <div className="skeleton reader-skeleton-title" style={{ width: "60%", marginBottom: 12 }} />
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="skeleton reader-skeleton-line" style={{ width: `${80 - (i % 4) * 10}%`, marginBottom: 10 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="reader-page">
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-2 p-0 sidebar-col">
            <Sidebar />
          </div>
          <div className="col-md-10 p-0">
            <div className="reader-container">
              <div className="reader-header">
                <h1 className="reader-title">Full Article</h1>
                <div className="reader-actions">
                  <button className="btn-primary" onClick={handleSummarize} disabled={summarizing}>
                    {summarizing ? "Summarizing..." : "Summarize Article"}
                  </button>
                </div>
              </div>
              {summary && (
                <div className="summary-card" >
                  <h2 className="summary-title">Summary</h2>
                  <div className="article-text">{summary}</div>
                </div>
              )}
              <br/>
              <div className="reader-card">
                <div className="article-text">{fullText}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
