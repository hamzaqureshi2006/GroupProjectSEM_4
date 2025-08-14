const axios = require("axios");

const getNews =  async (req, res) => {
    try {
        // Fetch top headlines (you can customize country, category, etc.)
        const NEWS_API_KEY = process.env.NEWS_API_KEY
        const newsRes = await axios.get(
            `https://newsapi.org/v2/top-headlines`,
            {
                params: {
                    country: "us",
                    pageSize: 10,
                    apiKey: NEWS_API_KEY
                }
            }
        );

        res.json({
            status: "ok",
            articles: newsRes.data.articles
        });

    } catch (error) {
        console.error("Error fetching news:", error.message);
        res.status(500).json({ error: "Failed to fetch news" });
    }
}

module.exports = {getNews};