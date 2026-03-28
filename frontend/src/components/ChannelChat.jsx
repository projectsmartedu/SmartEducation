import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Users, Settings, Search, MoreHorizontal, Smile, Paperclip } from 'lucide-react';
import './ChannelChat.css';

const ChannelChat = ({ classId, onClose }) => {
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDesc, setNewChannelDesc] = useState('');
    const messagesEndRef = useRef(null);

    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // Fetch channels for the class
    const fetchChannels = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/channels/class/${classId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setChannels(data);
                if (data.length > 0 && !selectedChannel) {
                    setSelectedChannel(data[0]._id);
                }
            }
        } catch (err) {
            console.error('Error fetching channels:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages for selected channel
    const fetchMessages = async () => {
        if (!selectedChannel) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/channels/${selectedChannel}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    // Send message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChannel) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/channels/${selectedChannel}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newMessage })
            });
            if (res.ok) {
                const newMsg = await res.json();
                setMessages([...messages, newMsg]);
                setNewMessage('');
            }
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    // Create new channel
    const handleCreateChannel = async () => {
        if (!newChannelName.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/channels`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newChannelName,
                    description: newChannelDesc,
                    classId: classId,
                    channelType: 'discussion'
                })
            });
            if (res.ok) {
                const newChannel = await res.json();
                setChannels([...channels, newChannel]);
                setSelectedChannel(newChannel._id);
                setShowCreateChannel(false);
                setNewChannelName('');
                setNewChannelDesc('');
            }
        } catch (err) {
            console.error('Error creating channel:', err);
        }
    };

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load channels on mount
    useEffect(() => {
        fetchChannels();
    }, [classId]);

    // Load messages when channel changes
    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 2 seconds
        const interval = setInterval(fetchMessages, 2000);
        return () => clearInterval(interval);
    }, [selectedChannel]);

    const currentChannel = channels.find(c => c._id === selectedChannel);

    return (
        <div className="channel-chat-container">
            <div className="channels-sidebar">
                <div className="sidebar-header">
                    <h3>Channels</h3>
                    <button
                        className="btn-icon"
                        onClick={() => setShowCreateChannel(true)}
                        title="Create channel"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="channels-list">
                    {channels.map(channel => (
                        <div
                            key={channel._id}
                            className={`channel-item ${selectedChannel === channel._id ? 'active' : ''}`}
                            onClick={() => setSelectedChannel(channel._id)}
                        >
                            <div className="channel-icon">#</div>
                            <div className="channel-info">
                                <div className="channel-name">{channel.name}</div>
                                <div className="channel-meta">{channel.messageCount} messages</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-main">
                {currentChannel && (
                    <>
                        <div className="chat-header">
                            <div className="header-info">
                                <h2>#{currentChannel.name}</h2>
                                <p>{currentChannel.description}</p>
                            </div>
                            <div className="header-actions">
                                <button className="btn-icon">
                                    <Users size={20} />
                                </button>
                                <button className="btn-icon">
                                    <Settings size={20} />
                                </button>
                                <button className="btn-icon" onClick={onClose}>
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="messages-container">
                            {messages.length === 0 ? (
                                <div className="no-messages">
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <div key={msg._id || idx} className="message">
                                        <div className="message-avatar">
                                            {msg.sender?.avatar ? (
                                                <img src={msg.sender.avatar} alt="" />
                                            ) : (
                                                <div>{msg.sender?.name?.[0] || 'U'}</div>
                                            )}
                                        </div>
                                        <div className="message-content">
                                            <div className="message-header">
                                                <strong>{msg.sender?.name}</strong>
                                                <span className="message-time">
                                                    {new Date(msg.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div className="message-text">{msg.content}</div>
                                            {msg.edited && <span className="edited">(edited)</span>}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="message-input-form" onSubmit={handleSendMessage}>
                            <div className="input-wrapper">
                                <button type="button" className="btn-icon">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="message-input"
                                />
                                <button type="button" className="btn-icon">
                                    <Smile size={20} />
                                </button>
                            </div>
                            <button type="submit" className="btn-send">
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                )}
            </div>

            {/* Create Channel Modal */}
            {showCreateChannel && (
                <div className="modal-overlay" onClick={() => setShowCreateChannel(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Create New Channel</h3>
                        <input
                            type="text"
                            placeholder="Channel name"
                            value={newChannelName}
                            onChange={(e) => setNewChannelName(e.target.value)}
                            className="modal-input"
                        />
                        <textarea
                            placeholder="Channel description (optional)"
                            value={newChannelDesc}
                            onChange={(e) => setNewChannelDesc(e.target.value)}
                            className="modal-input"
                            rows="3"
                        />
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowCreateChannel(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateChannel}
                            >
                                Create Channel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChannelChat;
