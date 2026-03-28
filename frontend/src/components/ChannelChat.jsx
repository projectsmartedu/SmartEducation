import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Plus, Users, Settings, Smile, Paperclip, Zap } from 'lucide-react';
import { io } from 'socket.io-client';
import './ChannelChat.css';

const ChannelChat = ({ classId, onClose }) => {
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDesc, setNewChannelDesc] = useState('');
    const [typingUsers, setTypingUsers] = useState({}); // {userId: userName}
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    // Initialize Socket.io connection
    useEffect(() => {
        const token = localStorage.getItem('token');
        socketRef.current = io(API_BASE, {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        socketRef.current.on('connect', () => {
            console.log('✅ Real-time chat connected');
            socketRef.current.emit('register', {
                userId: currentUser._id,
                role: currentUser.role
            });
        });

        socketRef.current.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });

        socketRef.current.on('disconnect', () => {
            console.log('⚠️  Chat disconnected - attempting to reconnect...');
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch channels for the class
    const fetchChannels = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/channels/class/${classId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setChannels(data);
                if (data.length > 0) {
                    setSelectedChannel(data[0]._id);
                }
            }
        } catch (err) {
            console.error('Error fetching channels:', err);
        }
    }, [API_BASE, classId]);

    // Fetch initial messages for selected channel
    const fetchMessages = useCallback(async () => {
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
    }, [API_BASE, selectedChannel]);

    // Handle channel selection - listen for real-time events
    useEffect(() => {
        if (!selectedChannel || !socketRef.current) return;

        // Join channel room
        socketRef.current.emit('joinChannel', {
            channelId: selectedChannel,
            userId: currentUser._id
        });

        // Listen for real-time message events
        socketRef.current.on('newMessage', ({ message }) => {
            setMessages(prev => [...prev, message]);
        });

        socketRef.current.on('messageEdited', ({ messageId, newContent }) => {
            setMessages(prev => prev.map(msg =>
                msg._id === messageId ? { ...msg, content: newContent, edited: true } : msg
            ));
        });

        socketRef.current.on('messageDeleted', ({ messageId }) => {
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
        });

        socketRef.current.on('reactionAdded', ({ emoji, userId }) => {
            setMessages(prev => prev.map(msg => {
                const reaction = msg.reactions?.find(r => r.emoji === emoji);
                if (reaction && !reaction.users.includes(userId)) {
                    reaction.users.push(userId);
                }
                return msg;
            }));
        });

        socketRef.current.on('userIsTyping', ({ userId, userName }) => {
            if (userId !== currentUser._id) {
                setTypingUsers(prev => ({ ...prev, [userId]: userName }));
            }
        });

        socketRef.current.on('userStoppedTyping', ({ userId }) => {
            setTypingUsers(prev => {
                const updated = { ...prev };
                delete updated[userId];
                return updated;
            });
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.off('newMessage');
                socketRef.current.off('messageEdited');
                socketRef.current.off('messageDeleted');
                socketRef.current.off('reactionAdded');
                socketRef.current.off('userIsTyping');
                socketRef.current.off('userStoppedTyping');
            }
        };
    }, [selectedChannel, currentUser._id]);

    // Load channels on mount
    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    // Load initial messages when channel changes
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

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
                setNewMessage('');
                // Clear typing indicator
                socketRef.current?.emit('stopTyping', {
                    channelId: selectedChannel,
                    userId: currentUser._id
                });
            }
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    // Handle typing with real-time indicator
    const handleTyping = (value) => {
        setNewMessage(value);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Send typing indicator
        socketRef.current?.emit('userTyping', {
            channelId: selectedChannel,
            userId: currentUser._id,
            userName: currentUser.name
        });

        // Auto stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit('stopTyping', {
                channelId: selectedChannel,
                userId: currentUser._id
            });
        }, 2000);
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
                                <div className="online-badge">
                                    <Zap size={18} />
                                    <span>Real-time</span>
                                </div>
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
                            {Object.entries(typingUsers).length > 0 && (
                                <div className="typing-indicator">
                                    <div className="dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                    <span>{Object.values(typingUsers).join(', ')} typing...</span>
                                </div>
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
                                    onChange={(e) => handleTyping(e.target.value)}
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
