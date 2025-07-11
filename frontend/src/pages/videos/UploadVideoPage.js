import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UploadVideoPage() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const navigate = useNavigate();

    const handleUpload = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", title);
        formData.append("category", category);
        formData.append("tags", tags);
        formData.append("video", videoFile);
        formData.append("thumbnail", thumbnailFile);

        try {

            const res = await axios.post("http://localhost:5000/api/videos/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true, // VERY IMPORTANT to include cookies
            });
            console.log(res);
            alert("Video uploaded successfully!");
            navigate("/"); // Redirect to homepage after upload
        } catch (err) {
            console.error(err);
            alert("Upload failed. Please check your inputs and try again.");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "600px" }}>
            <h2 className="mb-4">Upload Video</h2>
            <form onSubmit={handleUpload}>
                <div className="mb-3">
                    <label>Title</label>
                    <input
                        type="text"
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label>Category</label>
                    <select
                        className="form-control"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="Other">Select a category</option>
                        <option value="Music">Music</option>
                        <option value="Education">Education</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Vlog">Vlog</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label>Tags (comma separated)</label>
                    <input
                        type="text"
                        className="form-control"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label>Video File</label>
                    <input
                        type="file"
                        className="form-control"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files[0])}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label>Thumbnail Image</label>
                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => setThumbnailFile(e.target.files[0])}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                    Upload Video
                </button>
            </form>
        </div>
    );
}

export default UploadVideoPage;
