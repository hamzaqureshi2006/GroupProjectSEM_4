import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaPencilAlt } from 'react-icons/fa';

const EditProfilePage = () => {
    const [user, setUser] = useState(null);
    const [channelName, setChannelName] = useState('');
    const [email, setEmail] = useState('');
    const [logo, setLogo] = useState(null);
    const [banner, setBanner] = useState(null);
    const [isEditingChannelName, setIsEditingChannelName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [message, setMessage] = useState('');
    const channelNameInputRef = useRef(null);
    const emailInputRef = useRef(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/users/me', { withCredentials: true });
                setUser(res.data);
                setChannelName(res.data.channelName);
                setEmail(res.data.email);
            } catch (err) {
                console.error('Error fetching user:', err);
            }
        };
        fetchUser();
    }, []);

        const handleUpdate = async (e) => {
        e.preventDefault();
        try {
                                    const formData = new FormData();
            formData.append('channelName', channelName);
            formData.append('email', email);
            if (logo) formData.append('logo', logo);
            if (banner) formData.append('banner', banner);

            const res = await axios.post('http://localhost:5000/api/users/update-profile', 
                formData, 
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setMessage(res.data.message);
            setIsEditingChannelName(false);
            setIsEditingEmail(false);
        } catch (err) {
                        if (err.response && err.response.status === 400) {
                setMessage(err.response.data.message);
            } else {
                setMessage('An error occurred while updating the profile.');
            }
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="homepage fade-in">
            <Navbar />
            <div className="content">
                <Sidebar />
                <main className="main-content container mt-4">
                    <div className="card glass shadow-soft p-4" style={{ maxWidth: '600px', margin: 'auto' }}>
                        <h3 className="mb-4 text-center">Edit Profile</h3>
                                                {message && <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
                        
                        <div className="mb-3">
                            <label className="form-label">Channel Name</label>
                            <div className="input-group">
                                                                <input 
                                    ref={channelNameInputRef}
                                    type="text" 
                                    className="form-control"
                                    value={channelName} 
                                    onChange={(e) => setChannelName(e.target.value)} 
                                    readOnly={!isEditingChannelName} 
                                />
                                                                <button className="btn btn-outline-secondary" onClick={() => {
                                    setIsEditingChannelName(!isEditingChannelName);
                                    setTimeout(() => channelNameInputRef.current.focus(), 0);
                                }}>
                                    <FaPencilAlt />
                                </button>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <div className="input-group">
                                <input 
                                    ref={emailInputRef}
                                    type="email" 
                                    className="form-control"
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    readOnly={!isEditingEmail} 
                                />
                                                                <button className="btn btn-outline-secondary" onClick={() => {
                                    setIsEditingEmail(!isEditingEmail);
                                    setTimeout(() => emailInputRef.current.focus(), 0);
                                }}>
                                    <FaPencilAlt />
                                </button>
                            </div>
                        </div>


                                                <div className="mb-3">
                            <label className="form-label">Logo</label>
                            <input type="file" className="form-control" onChange={(e) => setLogo(e.target.files[0])} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Banner</label>
                            <input type="file" className="form-control" onChange={(e) => setBanner(e.target.files[0])} />
                        </div>

                        <button className="btn btn-primary w-100" onClick={handleUpdate}>Save Changes</button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EditProfilePage;
