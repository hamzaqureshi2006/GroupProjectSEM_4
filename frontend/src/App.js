import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import your page components
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import VideoWatchPage from "./pages/VideoWatchPage";
import NewsPage from "./pages/NewsPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User Profile */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Video Watch Page */}
        <Route path="/video/:id" element={<VideoWatchPage />} />

        {/* News Page */}
        <Route path="/news" element={<NewsPage />} />

        {/* Search Results */}
        <Route path="/search" element={<SearchResultsPage />} />

        {/* Settings Page */}
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
