import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";


function UploadPostPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");
    const [image, setImage] = useState(null);
    const navigate = useNavigate();

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!image) {
            alert("Please select an image for your post.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("category", category);
        formData.append("tags", tags);
        formData.append("image", image);

        try {
            const res = await axios.post("http://localhost:5000/api/posts/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });
            console.log(res);
            alert("Post uploaded successfully!");
            navigate("/"); // Redirect to homepage after upload
        } catch (err) {
            console.error(err);
            alert("Upload failed. Please check your inputs and try again.");
        }
    };

    return (
        <div className="homepage fade-in">
            <Navbar />
            <div className="content">
                <Sidebar />
                <div className="container mt-5" style={{ maxWidth: "600px" }}>
                    <h2 className="mb-4">Upload Post</h2>
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
                            <label>Category *</label>
                            <select
                                className="form-control"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                <option value="">Select a category</option>
                                <option value="Tech">Tech</option>
                                <option value="Lifestyle">Lifestyle</option>
                                <option value="Education">Education</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Sports">Sports</option>
                                <option value="Politics">Politics</option>
                                <option value="Health">Health</option>
                                <option value="Travel">Travel</option>
                                <option value="Food">Food</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label>Content</label>
                            <textarea
                                className="form-control"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={8}
                                placeholder="Write your post content here..."
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label>Tags (comma separated)</label>
                            <input
                                type="text"
                                className="form-control"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g., technology, programming, web development"
                            />
                        </div>

                        <div className="mb-3">
                            <label>Image *</label>
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={e => setImage(e.target.files[0])}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-100">
                            Upload Post
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UploadPostPage;
