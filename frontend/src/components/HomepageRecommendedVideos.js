import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './HomepageRecommendedVideos.css';

const HomepageRecommendedVideos = () => {
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchHomepageRecommendations();
  }, []);

  // Refresh recommendations every 5 minutes or when user returns to page
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHomepageRecommendations();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const fetchHomepageRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        'http://localhost:5000/api/videos/homepage-recommendations',
        { withCredentials: true }
      );
      
      setRecommendedVideos(response.data.recommendedVideos || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching homepage recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const videoDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - videoDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  if (loading) {
    return (
      <div className="homepage-recommendations">
        <h2>Recommended for You</h2>
        <div className="loading-skeleton">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="video-skeleton">
              <div className="thumbnail-skeleton"></div>
              <div className="info-skeleton">
                <div className="title-skeleton"></div>
                <div className="channel-skeleton"></div>
                <div className="stats-skeleton"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="homepage-recommendations">
        <h2>Recommended for You</h2>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchHomepageRecommendations} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (recommendedVideos.length === 0) {
    return (
      <div className="homepage-recommendations">
        <h2>Recommended for You</h2>
        <div className="no-recommendations">
          <p>No recommendations available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage-recommendations">
      <div className="header-section">
        <h2>Recommended for You</h2>
        <div className="header-actions">
          <button 
            onClick={fetchHomepageRecommendations} 
            className="refresh-btn"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 New Recommendations'}
          </button>
          <span className="last-refresh">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>
      <div className="videos-grid">
        {recommendedVideos.map((video) => (
          <Link
            key={video._id}
            to={`/watch?video_id=${video._id}`}
            className="video-card"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="video-thumbnail">
              <img 
                src={video.thumbnail_url} 
                alt={video.title}
                onError={(e) => {
                  e.target.src = 'https://dummyimage.com/300x180/eee/aaa';
                }}
              />
              {video.duration > 0 && (
                <span className="duration">{formatDuration(video.duration)}</span>
              )}
            </div>
            
            <div className="video-info">
              <h3 className="video-title" title={video.title}>
                {video.title.length > 60 
                  ? video.title.substring(0, 60) + '...' 
                  : video.title
                }
              </h3>
              
              <p className="channel-name">
                {video.user_id?.channelName || 'Unknown Channel'}
              </p>
              
              <div className="video-stats">
                <span className="views">{formatViews(video.views)} views</span>
                <span className="dot">•</span>
                <span className="time-ago">{formatTimeAgo(video.timestamp)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomepageRecommendedVideos;
