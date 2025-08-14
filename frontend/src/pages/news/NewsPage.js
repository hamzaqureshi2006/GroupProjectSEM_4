import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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

  if (loading) return <p>Loading news...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Latest News</h1>
      {articles.map((article, idx) => (
        <div key={idx} style={{ marginBottom: "20px", borderBottom: "1px solid #ccc" }}>
          {article.urlToImage && (
            <img src={article.urlToImage} alt={article.title} style={{ maxWidth: "300px" }} />
          )}
          <h2>{article.title}</h2>
          <p>{article.description}</p>
          <Link to={`/news/read?url=${encodeURIComponent(article.url)}`}>
            <button>Read More</button>
          </Link>
        </div>
      ))}
    </div>
  );
}
