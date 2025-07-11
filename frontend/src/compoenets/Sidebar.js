import { useNavigate } from "react-router-dom";
export default function Sidebar() {
    const navigate = useNavigate();
    return (
        <aside className="sidebar bg-light p-3" style={{ minHeight: "100vh", borderRight: "1px solid #dee2e6" }}>
            <ul className="list-unstyled">
                <li className="mb-3 sidebar-item" onClick={() => navigate("/")}>Home</li>
                <li className="mb-3 sidebar-item" onClick={() => navigate("/liked")}>Liked Videos</li>
                <li className="mb-3 sidebar-item" onClick={() => navigate("/subscribedChannels")}>Subscribed Channels</li>
                <li className="mb-3 sidebar-item" onClick={() => navigate("/watchHistory")}>Watch History</li>
                <li className="mb-3 sidebar-item" onClick={() => navigate("/news")}>News</li>
            </ul>
        </aside>
    );
}