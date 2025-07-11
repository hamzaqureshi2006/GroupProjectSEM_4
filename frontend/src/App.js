import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import your page components
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/profile/ProfilePage";
import SettingsPage from "./pages/profile/SettingsPage";
import NewsPage from "./pages/news/NewsPage";
import UploadVideoPage from "./pages/videos/UploadVideoPage";
import VideoWatchPage from "./pages/videos/VideoWatchPage";
import SearchResultsPage from "./pages/videos/SearchResultsPage";
import LikedVideosPages from "./pages/videos/LikedVideosPages";
import WatchHistoryPage from "./pages/videos/WatchHistoryPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* upload video page */}
        <Route path="/upload" element={<UploadVideoPage />} />
        {/* Liked Videos Page */}
        <Route path="/liked" element={<LikedVideosPages />} />
        {/* Watch History Page */}
        <Route path="/watchHistory" element={<WatchHistoryPage />} />

        {/* Video Watch Page */}
        <Route path="/video/:id" element={<VideoWatchPage />} />

        <Route path="/news" element={<NewsPage />} />

        <Route path="/search" element={<SearchResultsPage />} />

        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
