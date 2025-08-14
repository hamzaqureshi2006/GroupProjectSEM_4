import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

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

  if (loading) return <p>Loading article...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Full Article</h1>
      <p>{fullText}</p>

      <hr />
      <button onClick={handleSummarize} disabled={summarizing}>
        {summarizing ? "Summarizing..." : "Summarize Article"}
      </button>

      {summary && (
        <div style={{ marginTop: "20px", padding: "10px" }}>
          <h2>Summary</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
