import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

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

        {/* Authentication Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Profile Settings Page */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />


        {/* Video Pages*/}
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/upload" element={<UploadVideoPage />} />
        <Route path="/watch" element={<VideoWatchPage />} />
        <Route path="/liked" element={<LikedVideosPages />} />
        <Route path="/watchHistory" element={<WatchHistoryPage />} />

        {/* News Page */}
        <Route path="/news" element={<NewsPage />} />


      </Routes>
    </Router>
  );
}

export default App;
