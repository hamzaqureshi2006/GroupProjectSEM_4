import { useNavigate } from "react-router-dom";
export default function Sidebar() {
    const navigate = useNavigate();
    return (
        <aside className="sidebar">
            <ul>
                <li className="sidebar-item" onClick={() => navigate("/")}>Home</li>
                <li className="sidebar-item" onClick={() => navigate("/liked")}>Liked Videos</li>
                <li className="sidebar-item" onClick={() => navigate("/subscribedChannels")}>Subscribed Channels</li>
                <li className="sidebar-item" onClick={() => navigate("/watchHistory")}>Watch History</li>
                <li className="sidebar-item" onClick={() => navigate("/news")}>News</li>
                <li className="sidebar-item" onClick={() => navigate("/about")}>About</li>
                <li className="sidebar-item" onClick={() => navigate("/contact")}>Contact</li>
            </ul>
        </aside>
    );
}