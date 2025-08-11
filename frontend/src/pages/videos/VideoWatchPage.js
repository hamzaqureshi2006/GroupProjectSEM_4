import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './videoWatchPage.css';
import Navbar from '../../compoenets/Navbar';
import Sidebar from '../../compoenets/Sidebar';
import axios from 'axios';

function VideoWatchPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const video_id = queryParams.get("video_id");

  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [video, setVideo] = useState(null);
  const [uploader, setUploader] = useState({});
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);  // Add user state
const [currentUser, setCurrentUser] = useState(null);   

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/me", { withCredentials: true });
      setCurrentUser(res.data);
    } catch (err) {
      console.error("Failed to fetch current user", err);
    }
  };
  fetchUser();
}, []);

  useEffect(() => {
  const fetchVideoAndComments = async () => {
    try {
      const videoRes = await axios.get(
        `http://localhost:5000/api/videos/watchVideo/${video_id}`,
        { withCredentials: true }
      );
      setVideo(videoRes.data);
      setIsLiked(videoRes.data.isLiked);
      setIsDisliked(videoRes.data.isDisliked);
      setIsSubscribed(videoRes.data.isSubscribed);
      setUploader(videoRes.data.user_id);

      const commentsRes = await axios.get(
        `http://localhost:8000/api/comments/list/?video_id=${video_id}`
      );
      setComments(commentsRes.data);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching video or comments:", err);
      setLoading(false);
    }
  };

  if (video_id) fetchVideoAndComments();
}, [video_id, currentUser]); 

  const handleCommentSubmit = async (e) => {
  e.preventDefault();
  if (!commentInput.trim()) return;
  if (!currentUser?._id) {
    alert("You must be logged in to comment.");
    return;
  }

  try {
    const res = await axios.post(
  "http://localhost:8000/api/comments/create/",
  {
    commentText: commentInput,
    video_id: video_id,
    user_id: currentUser._id,
  }
);

    setComments((prev) => [...prev, res.data]);
    setCommentInput("");
  } catch (err) {
    console.error("Failed to add comment:", err);
    alert("Failed to add comment.");
  }
};

  if (loading) return <div>Loading...</div>;
  if (!video) return <div>Video not found</div>;

  return (
    <>
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-2 p-0">
            <Sidebar />
          </div>
          <div className="col-md-10 mt-3">
            <div className="row">
              <div className="col-md-8">
                {/* Video Player */}
                <div className="embed-responsive embed-responsive-16by9">
                  <video
                    controls
                    src={video.video_url}
                    className="embed-responsive-item"
                    style={{ width: "100%", borderRadius: "10px" }}
                  />
                </div>
                {/* Video Title */}
                <h4 className="mt-3 fw-bold">{video.title}</h4>
                {/* Uploader Section */}
                <div className="d-flex align-items-center justify-content-between mt-2 mb-3">
                  <div className="d-flex align-items-center">
                    <img
                      src={video.user_id?.logo || "/profilePicture.png"}
                      alt="Channel Logo"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        marginRight: "10px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: "bold" }}>{uploader.channelName || "Uploader"}</div>
                      <small className="text-muted">{uploader.subscribers}</small>
                    </div>
                  </div>
                  <button
                    className={`${isSubscribed ? "btn-unsubscribe" : "btn-subscribe"}`}
                    onClick={() => {
                      // TODO: Implement subscription toggle logic here
                    }}
                  >
                    {isSubscribed ? "Unsubscribe" : "Subscribe"}
                  </button>
                </div>
                {/* Comments Section */}
                <h5 className="mt-4">Comments</h5>
                {/* Comment Input */}
                <form onSubmit={handleCommentSubmit} className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={currentUser ? "Add a comment..." : "Login to comment"}
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      disabled={!currentUser}
                    />
                    <button className="p-2 btn btn-primary" type="submit" disabled={!currentUser}>
                      Comment
                    </button>
                  </div>
                </form>
                {/* Comments List */}
                <div className="py-4" style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {comments.map((comment, idx) => (
                    <div
                      key={comment._id || idx}
                      className="d-flex mb-3"
                      style={{ position: "relative" }}
                    >
                      <img
                        src={"/profilePicture.png"}
                        alt="User"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          marginRight: "10px",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ position: "relative" }}>
                        <div className="fw-bold" style={{ position: "relative" }}>
                          @User
                          <span className="ms-2 text-muted" style={{ fontSize: "12px" }}>
                            {comment.timestamp ? new Date(comment.timestamp).toLocaleDateString() : ""}
                          </span>
                          {comment.is_spam && (
                            <span
                              style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                background: "red",
                                color: "white",
                                borderRadius: "8px",
                                padding: "2px 8px",
                                fontSize: "10px",
                                fontWeight: "bold",
                                marginLeft: "8px",
                                zIndex: 2,
                              }}
                            >
                              SPAM
                            </span>
                          )}
                        </div>
                        <div>{comment.commentText}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Recommended Videos Sidebar */}
              <div className="col-md-4">
                <h5>Recommended Videos</h5>
                {/* Future: map recommended videos here */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default VideoWatchPage;
