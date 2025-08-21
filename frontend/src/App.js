import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";

// Import your page components
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/profile/ProfilePage";
import SettingsPage from "./pages/profile/SettingsPage";
import NewsPage from "./pages/news/NewsPage";
import ReadArticlePage from "./pages/news/ReadArticlePage";
import UploadVideoPage from "./pages/videos/UploadVideoPage";
import VideoWatchPage from "./pages/videos/VideoWatchPage";
import SearchResultsPage from "./pages/videos/SearchResultsPage";
import LikedVideosPages from "./pages/videos/LikedVideosPage";
import WatchHistoryPage from "./pages/videos/WatchHistoryPage";

// Post Pages
import UploadPostPage from "./pages/posts/UploadPostPage";
import MyPostsPage from "./pages/posts/MyPostsPage";
import RecommendedPostsPage from "./pages/posts/RecommendedPostsPage";
import PostDetailPage from "./pages/posts/PostDetailPage";
import LikedPostsPage from "./pages/posts/LikedPostsPage";
import SubscribedChannelsPage from "./pages/subscribedChannels/subscribedChannelsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ChannelPage from "./pages/channel/ChannelPage";

function App() {
  return (
    <Router>
      <div className="app-container">
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

        {/* Post Pages */}
  <Route path="/upload-post" element={<UploadPostPage />} />
  {/* <Route path="/my-posts" element={<MyPostsPage />} /> */}
  <Route path="/recommended-posts" element={<RecommendedPostsPage />} />
  <Route path="/liked-posts" element={<LikedPostsPage />} />
  <Route path="/post/:id" element={<PostDetailPage />} />
 
 

        {/* subscribed Channels */}
        <Route path="/subscribedChannels" element={<SubscribedChannelsPage />} />
        {/* Channel Page */}
        <Route path="/channel/:id" element={<ChannelPage />} />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<h1>404 Not Found</h1>} />

        {/* News Page */}
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/read" element={<ReadArticlePage />} />

        {/* Static Pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />


        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
