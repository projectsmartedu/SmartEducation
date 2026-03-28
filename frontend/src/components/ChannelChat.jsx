import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Plus, Users, Settings, Smile, Paperclip, Zap, MessageCircle, X, Share2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './ChannelChat.css';

const ChannelChat = ({ classId, onClose }) => {
    const { channelId: urlChannelId } = useParams();
    const navigate = useNavigate();

    // View mode: 'channels' or 'dms'
    const [viewMode, setViewMode] = useState('channels');

    // Course states
    const [courseInfo, setCourseInfo] = useState(null);

    // Channel states
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDesc, setNewChannelDesc] = useState('');

    // DM states
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [courseMembers, setCourseMembers] = useState([]);
    const [showMemberList, setShowMemberList] = useState(false);
    const [showChannelMembers, setShowChannelMembers] = useState(false);

    // General states
    const [newMessage, setNewMessage] = useState('');
    const [typingUsers, setTypingUsers] = useState({});
    const [showSettings, setShowSettings] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    const isInitialLoadRef = useRef(true);

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

    // Fetch course info
    const fetchCourseInfo = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/courses/${classId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                console.log('📚 Course info:', data.course?.name);
                setCourseInfo(data.course);
            }
        } catch (err) {
            console.error('❌ Error fetching course:', err);
        }
    }, [API_BASE, classId]);

    // Fetch channels for the class - auto-create "General" if none exist
    const fetchChannels = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/channels/class/${classId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                console.log('📋 Fetched channels:', data);

                // Filter out duplicate "General" channels - keep only one
                const uniqueChannels = [];
                let generalChannelExists = false;

                for (const channel of data) {
                    if (channel.name === 'General') {
                        if (!generalChannelExists) {
                            uniqueChannels.push(channel);
                            generalChannelExists = true;
                        }
                        // Skip duplicate General channels
                    } else {
                        uniqueChannels.push(channel);
                    }
                }

                if (uniqueChannels.length === 0) {
                    // No channels exist - create a default "General" channel
                    console.log('📝 Creating default General channel...');
                    const createRes = await fetch(`${API_BASE}/api/channels`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: 'General',
                            description: 'General discussion for this class',
                            classId: classId,
                            channelType: 'discussion'
                        })
                    });

                    if (createRes.ok) {
                        const newChannel = await createRes.json();
                        console.log('✅ Created default channel:', newChannel);
                        setChannels([newChannel]);
                        setSelectedChannel(newChannel._id);
                        navigate(`/channels/${newChannel._id}`);
                    }
                } else {
                    setChannels(uniqueChannels);
                    if (uniqueChannels.length > 0) {
                        // Use URL channel if available, otherwise use first channel
                        const channelToSelect = urlChannelId || uniqueChannels[0]._id;
                        setSelectedChannel(channelToSelect);
                    }
                }
            } else {
                console.error('Failed to fetch channels:', res.status);
            }
        } catch (err) {
            console.error('❌ Error fetching channels:', err);
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
                console.log('💬 Fetched messages:', data.messages?.length || 0);
                console.log('📋 Channel data:', data.channel);
                setMessages(data.messages || []);
                // Update the channel in state with populated member data
                if (data.channel) {
                    setChannels(prev => prev.map(ch =>
                        ch._id === selectedChannel ? data.channel : ch
                    ));
                }
            } else {
                console.error('Failed to fetch messages:', res.status, res.statusText);
            }
        } catch (err) {
            console.error('❌ Error fetching messages:', err);
        }
    }, [API_BASE, selectedChannel]);

    // Fetch course members for DM
    const fetchCourseMembers = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/courses/${classId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const members = data.course?.enrolledStudents || [];
                // Filter out current user
                const filtered = members.filter(m => m._id !== currentUser._id);
                setCourseMembers(filtered);
                console.log('👥 Fetched course members:', filtered);
            }
        } catch (err) {
            console.error('❌ Error fetching members:', err);
        }
    }, [API_BASE, classId, currentUser._id]);

    // Fetch DM conversations
    const fetchConversations = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/direct-messages/conversations/${classId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
                console.log('💬 Fetched conversations:', data);
            }
        } catch (err) {
            console.error('❌ Error fetching conversations:', err);
        }
    }, [API_BASE, classId]);

    // Fetch DM messages
    const fetchDMMessages = useCallback(async (conversationId) => {
        if (!conversationId) return;

        try {
            console.log('📥 Fetching DM messages for conversation:', conversationId);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/direct-messages/conversations/${conversationId}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                console.log('✅ Loaded', data.messages?.length || 0, 'DM messages');
                setMessages(data.messages || []);
            } else {
                console.error('❌ Failed to fetch DM messages:', res.status);
                setMessages([]);
            }
        } catch (err) {
            console.error('❌ Error fetching DM messages:', err);
            setMessages([]);
        }
    }, [API_BASE]);

    // Fetch course info on component mount
    useEffect(() => {
        fetchCourseInfo();
        fetchChannels();
    }, [fetchCourseInfo, fetchChannels]);

    // Fetch messages when channel is selected
    useEffect(() => {
        if (selectedChannel) {
            fetchMessages();
        }
    }, [selectedChannel, fetchMessages]);

    // Handle channel selection - listen for real-time events
    useEffect(() => {
        if (!selectedChannel || !socketRef.current) return;

        console.log('🔄 Channel changed to:', selectedChannel);

        // Remove any existing listeners to avoid duplicates
        socketRef.current.off('newMessage');
        socketRef.current.off('messageEdited');
        socketRef.current.off('messageDeleted');
        socketRef.current.off('reactionAdded');
        socketRef.current.off('userIsTyping');
        socketRef.current.off('userStoppedTyping');

        // Join channel room
        console.log('👉 Joining channel room:', `channel_${selectedChannel}`);
        socketRef.current.emit('joinChannel', {
            channelId: selectedChannel,
            userId: currentUser._id
        });

        // Listen for real-time message events (fresh listeners)
        const handleNewMessage = ({ message }) => {
            console.log('✅ NEW MESSAGE EVENT RECEIVED!');
            console.log('   📨 Content:', message.content, 'from', message.sender?.name);
            console.log('   Channel:', message.channel, 'Selected:', selectedChannel);

            // Only add message if it belongs to the current channel
            if (message.channel === selectedChannel) {
                setMessages(prev => [...prev, message]);
                // Update channel message count
                setChannels(prev => prev.map(ch =>
                    ch._id === selectedChannel
                        ? { ...ch, messageCount: (ch.messageCount || 0) + 1 }
                        : ch
                ));
            }
        };

        const handleEditMessage = ({ messageId, newContent }) => {
            console.log('✏️ Message edited:', messageId);
            setMessages(prev => prev.map(msg =>
                msg._id === messageId ? { ...msg, content: newContent, edited: true } : msg
            ));
        };

        const handleDeleteMessage = ({ messageId }) => {
            console.log('🗑️ Message deleted:', messageId);
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
            setChannels(prev => prev.map(ch =>
                ch._id === selectedChannel
                    ? { ...ch, messageCount: Math.max(0, (ch.messageCount || 1) - 1) }
                    : ch
            ));
        };

        const handleReaction = ({ emoji, userId }) => {
            setMessages(prev => prev.map(msg => {
                const reaction = msg.reactions?.find(r => r.emoji === emoji);
                if (reaction && !reaction.users.includes(userId)) {
                    reaction.users.push(userId);
                }
                return msg;
            }));
        };

        const handleTyping = ({ userId, userName }) => {
            if (userId !== currentUser._id) {
                setTypingUsers(prev => ({ ...prev, [userId]: userName }));
            }
        };

        const handleStopTyping = ({ userId }) => {
            setTypingUsers(prev => {
                const updated = { ...prev };
                delete updated[userId];
                return updated;
            });
        };

        console.log('🎧 Adding Socket.io listeners for channel:', selectedChannel);
        socketRef.current.on('newMessage', handleNewMessage);
        socketRef.current.on('messageEdited', handleEditMessage);
        socketRef.current.on('messageDeleted', handleDeleteMessage);
        socketRef.current.on('reactionAdded', handleReaction);
        socketRef.current.on('userIsTyping', handleTyping);
        socketRef.current.on('userStoppedTyping', handleStopTyping);

        return () => {
            console.log('🧹 Cleaning up listeners for channel:', selectedChannel);
            if (socketRef.current) {
                socketRef.current.off('newMessage', handleNewMessage);
                socketRef.current.off('messageEdited', handleEditMessage);
                socketRef.current.off('messageDeleted', handleDeleteMessage);
                socketRef.current.off('reactionAdded', handleReaction);
                socketRef.current.off('userIsTyping', handleTyping);
                socketRef.current.off('userStoppedTyping', handleStopTyping);
            }
        };
    }, [selectedChannel, currentUser._id]);

    // Handle DM socket events
    useEffect(() => {
        if (!selectedConversation || !socketRef.current) return;

        socketRef.current.on('directMessage', ({ message }) => {
            if (message.conversation === selectedConversation) {
                setMessages(prev => [...prev, message]);
            }
        });

        socketRef.current.on('directMessageEdited', ({ messageId, newContent }) => {
            setMessages(prev => prev.map(msg =>
                msg._id === messageId ? { ...msg, content: newContent, edited: true } : msg
            ));
        });

        socketRef.current.on('directMessageDeleted', ({ messageId }) => {
            setMessages(prev => prev.filter(msg => msg._id !== messageId));
        });

        socketRef.current.on('directMessageReaction', ({ messageId, emoji, userId }) => {
            setMessages(prev => prev.map(msg => {
                if (msg._id === messageId) {
                    const reaction = msg.reactions?.find(r => r.emoji === emoji);
                    if (reaction && !reaction.users.includes(userId)) {
                        reaction.users.push(userId);
                    }
                }
                return msg;
            }));
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.off('directMessage');
                socketRef.current.off('directMessageEdited');
                socketRef.current.off('directMessageDeleted');
                socketRef.current.off('directMessageReaction');
            }
        };
    }, [selectedConversation]);

    // Add Emoji handler
    const addEmoji = (emoji) => {
        setNewMessage(newMessage + emoji);
        setShowEmojiPicker(false);
    };

    // Add emoji list
    const emojis = ['😀', '😂', '😍', '🤔', '😢', '😡', '👍', '👎', '🎉', '🔥', '💯', '✨'];

    // Generate shareable link
    const generateShareLink = () => {
        const link = `${window.location.origin}/channels/${selectedChannel}`;
        setShareLink(link);
        setShowShareModal(true);
    };

    // Copy link to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        alert('✅ Link copied to clipboard!');
    };

    // Handle file upload
    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files || !files[0]) return;

        const file = files[0];
        console.log('📎 Uploading file:', file.name);

        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('❌ File too large! Max 10MB');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('channelId', selectedChannel);

            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/channels/${selectedChannel}/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                console.log('✅ File uploaded:', data.attachment);
                // Add file as message
                setNewMessage(`📎 ${file.name}: ${data.attachment}`);
            } else {
                alert('❌ Upload failed');
            }
        } catch (err) {
            console.error('❌ Upload error:', err);
            alert('❌ Upload error');
        }

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Load channels on mount
    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    // Handle URL channel ID parameter
    useEffect(() => {
        if (urlChannelId && channels.length > 0) {
            const channel = channels.find(c => c._id === urlChannelId);
            if (channel) {
                setSelectedChannel(urlChannelId);
            }
        }
    }, [urlChannelId, channels]);

    // Load initial messages when channel changes
    useEffect(() => {
        console.log('📨 Channel changed, fetching messages for:', selectedChannel);
        if (selectedChannel) {
            fetchMessages();
        }
    }, [selectedChannel]);

    // Load DM messages when conversation changes
    useEffect(() => {
        console.log('💬 Conversation changed, fetching DM messages for:', selectedConversation);
        if (selectedConversation && viewMode === 'dms') {
            fetchDMMessages(selectedConversation);
        }
    }, [selectedConversation, viewMode]);

    // Switch view mode and load appropriate messages
    useEffect(() => {
        console.log('🔄 View mode changed to:', viewMode);
        if (viewMode === 'channels' && selectedChannel) {
            console.log('📨 Loading channel messages...');
            fetchMessages();
        } else if (viewMode === 'dms' && selectedConversation) {
            console.log('💬 Loading DM messages...');
            fetchDMMessages(selectedConversation);
        }
    }, [viewMode, selectedChannel, selectedConversation, fetchMessages, fetchDMMessages]);

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

    // Start DM with a user
    const startDM = useCallback(async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/direct-messages/conversations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, courseId: classId })
            });
            if (res.ok) {
                const conversation = await res.json();

                // Add to conversations list if not already there
                setConversations(prev => {
                    const exists = prev.find(c => c._id === conversation._id);
                    if (!exists) {
                        console.log('✅ Adding new conversation to list:', conversation._id);
                        return [conversation, ...prev];
                    }
                    return prev;
                });

                setSelectedConversation(conversation._id);
                setViewMode('dms');
                setMessages([]);
                setShowMemberList(false);

                // Fetch messages for this conversation
                await fetchDMMessages(conversation._id);

                // Join DM room
                socketRef.current?.emit('joinDMConversation', {
                    conversationId: conversation._id,
                    userId: currentUser._id
                });
            }
        } catch (err) {
            console.error('❌ Error starting DM:', err);
        }
    }, [classId, currentUser._id, API_BASE, fetchDMMessages]);

    // Send DM
    const handleSendDM = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/direct-messages/conversations/${selectedConversation}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newMessage })
            });
            if (res.ok) {
                setNewMessage('');
            }
        } catch (err) {
            console.error('❌ Error sending DM:', err);
        }
    };

    // Load members and conversations on mount
    useEffect(() => {
        fetchCourseMembers();
        fetchConversations();
    }, [fetchCourseMembers, fetchConversations]);

    // Auto-scroll to bottom when messages change (but not on initial load)
    useEffect(() => {
        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
            return;
        }
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 0);
    }, [messages]);

    const currentChannel = channels.find(c => c._id === selectedChannel);
    const currentConversation = conversations.find(c => c._id === selectedConversation);

    return (
        <div className="channel-chat-container">
            <div className="channels-sidebar">
                {/* View Mode Tabs */}
                <div className="view-mode-tabs">
                    <button
                        className={`tab ${viewMode === 'channels' ? 'active' : ''}`}
                        onClick={() => setViewMode('channels')}
                    >
                        # Channels
                    </button>
                    <button
                        className={`tab ${viewMode === 'dms' ? 'active' : ''}`}
                        onClick={() => setViewMode('dms')}
                    >
                        💬 Direct
                    </button>
                </div>

                {/* Channels View */}
                {viewMode === 'channels' && (
                    <>
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
                                    onClick={() => {
                                        setSelectedChannel(channel._id);
                                        navigate(`/channels/${channel._id}`);
                                    }}
                                >
                                    <div className="channel-icon">#</div>
                                    <div className="channel-info">
                                        <div className="channel-name">
                                            {channel.name}
                                            {channel.name === 'General' && channel.channelType === 'discussion' && (
                                                <span style={{ fontSize: '11px', color: '#a0aec0', marginLeft: '4px' }}>(default)</span>
                                            )}
                                        </div>
                                        <div className="channel-meta">{channel.messageCount} messages</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* DMs View */}
                {viewMode === 'dms' && (
                    <>
                        <div className="sidebar-header">
                            <h3>Messages</h3>
                            <button
                                className="btn-icon"
                                onClick={() => setShowMemberList(!showMemberList)}
                                title="New message"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {showMemberList && (
                            <div className="members-list">
                                <div className="members-header">
                                    <h4>Start Chat</h4>
                                    <button onClick={() => setShowMemberList(false)}>
                                        <X size={16} />
                                    </button>
                                </div>
                                {courseMembers.map(member => (
                                    <div
                                        key={member._id}
                                        className="member-item"
                                        onClick={() => startDM(member._id)}
                                    >
                                        <div className="member-avatar">
                                            {member.avatar ? (
                                                <img src={member.avatar} alt="" />
                                            ) : (
                                                <div>{member.name?.[0] || 'U'}</div>
                                            )}
                                        </div>
                                        <div className="member-info">
                                            <div>{member.name}</div>
                                            <div style={{ fontSize: '0.85em', color: '#666' }}>
                                                {member.email}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="conversations-list">
                            {conversations.map(conv => {
                                const otherUser = conv.participants.find(p => p._id !== currentUser._id);
                                return (
                                    <div
                                        key={conv._id}
                                        className={`conversation-item ${selectedConversation === conv._id ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedConversation(conv._id);
                                            fetchDMMessages(conv._id);
                                            socketRef.current?.emit('joinDMConversation', {
                                                conversationId: conv._id,
                                                userId: currentUser._id
                                            });
                                        }}
                                    >
                                        <div className="member-avatar">
                                            {otherUser?.avatar ? (
                                                <img src={otherUser.avatar} alt="" />
                                            ) : (
                                                <div>{otherUser?.name?.[0] || 'U'}</div>
                                            )}
                                        </div>
                                        <div className="conversation-info">
                                            <div>{otherUser?.name}</div>
                                            <div style={{ fontSize: '0.85em', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {conv.lastMessage?.content || 'No messages yet'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            <div className="chat-main">
                {viewMode === 'channels' && currentChannel && (
                    <>
                        <div className="chat-header">
                            <div className="header-info">
                                <div className="header-breadcrumb">
                                    {courseInfo?.name && (
                                        <span className="course-name">{courseInfo.name}</span>
                                    )}
                                    <span className="divider">›</span>
                                    <h2>#{currentChannel.name}</h2>
                                </div>
                                <p>{currentChannel.description}</p>
                            </div>
                            <div className="header-actions">
                                <div className="online-badge">
                                    <Zap size={18} />
                                    <span>Real-time</span>
                                </div>
                                <button
                                    className="btn-icon"
                                    onClick={generateShareLink}
                                    title="Share channel link"
                                >
                                    <Share2 size={20} />
                                </button>
                                <button
                                    className="btn-icon"
                                    onClick={() => setShowChannelMembers(!showChannelMembers)}
                                    title="View members"
                                >
                                    <Users size={20} />
                                </button>
                                <button
                                    className="btn-icon"
                                    onClick={() => setShowSettings(true)}
                                    title="Channel settings"
                                >
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
                                messages.map((msg, idx) => {
                                    const isSent = msg.sender?._id === currentUser._id;
                                    return (
                                        <div key={msg._id || idx} className={`message ${isSent ? 'sent' : 'received'}`}>
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
                                    );
                                })
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
                                <button
                                    type="button"
                                    className="btn-icon"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Attach file (PDF, notes, etc)"
                                >
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip"
                                />
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => handleTyping(e.target.value)}
                                    className="message-input"
                                />
                                <button
                                    type="button"
                                    className="btn-icon"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                >
                                    <Smile size={20} />
                                </button>
                            </div>
                            <button type="submit" className="btn-send">
                                <Send size={20} />
                            </button>
                        </form>

                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div style={{
                                padding: '12px',
                                background: '#f7fafc',
                                borderTop: '1px solid #e2e8f0',
                                display: 'flex',
                                gap: '8px',
                                flexWrap: 'wrap'
                            }}>
                                {emojis.map((emoji, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => addEmoji(emoji)}
                                        style={{
                                            background: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            fontSize: '18px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.target.style.background = '#edf2f7'}
                                        onMouseOut={(e) => e.target.style.background = 'white'}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Members Panel */}
                        {showChannelMembers && (
                            <div className="members-panel">
                                <div className="members-header">
                                    <h4>Members ({currentChannel.members?.length || 0})</h4>
                                    <button onClick={() => setShowChannelMembers(false)}>
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="members-list-panel">
                                    {currentChannel.members && currentChannel.members.length > 0 ? (
                                        currentChannel.members.map(member => {
                                            // Handle both object and ID cases
                                            const memberObj = typeof member === 'object' ? member : { _id: member };
                                            const memberName = memberObj.name || memberObj.username || 'Unknown';
                                            const memberEmail = memberObj.email || '';
                                            const memberInitial = memberName?.[0] || 'U';
                                            
                                            console.log('👤 Member data:', { memberName, memberEmail, memberInitial });
                                            
                                            return (
                                                <div key={memberObj._id} className="member-item-panel">
                                                    <div className="member-avatar">
                                                        {memberObj.avatar ? (
                                                            <img src={memberObj.avatar} alt="" />
                                                        ) : (
                                                            <div>{memberInitial}</div>
                                                        )}
                                                    </div>
                                                    <div className="member-info">
                                                        <div className="member-name">{memberName}</div>
                                                        <div className="member-email">{memberEmail}</div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No members yet</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* DM View */}
                {viewMode === 'dms' && currentConversation && (
                    <>
                        <div className="chat-header">
                            <div className="header-info">
                                <h2>
                                    {currentConversation.participants
                                        .find(p => p._id !== currentUser._id)?.name || 'Unknown'}
                                </h2>
                                <p>Direct Message</p>
                            </div>
                            <div className="header-actions">
                                <div className="online-badge">
                                    <Zap size={18} />
                                    <span>Real-time</span>
                                </div>
                                <button className="btn-icon" onClick={onClose}>
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="messages-container">
                            {messages.length === 0 ? (
                                <div className="no-messages">
                                    <p>📨 Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isSent = msg.sender?._id === currentUser._id;
                                    return (
                                        <div key={msg._id || idx} className={`message ${isSent ? 'sent' : 'received'}`}>
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
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="message-input-form" onSubmit={handleSendDM}>
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

                {/* Empty state */}
                {viewMode === 'dms' && !currentConversation && (
                    <div className="empty-chat">
                        <MessageCircle size={48} />
                        <p>Select a conversation or start a new one</p>
                    </div>
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

            {/* Settings Modal */}
            {showSettings && (
                <div className="modal-overlay" onClick={() => setShowSettings(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Channel Settings</h3>
                        <div style={{ marginBottom: '16px' }}>
                            <p style={{ marginBottom: '8px', color: '#1a202c', fontWeight: 500 }}>
                                Channel Name: <strong>{currentChannel?.name}</strong>
                            </p>
                            <p style={{ marginBottom: '8px', color: '#1a202c', fontWeight: 500 }}>
                                Members: <strong>{currentChannel?.members?.length || 0}</strong>
                            </p>
                            <p style={{ marginBottom: '8px', color: '#1a202c', fontWeight: 500 }}>
                                Messages: <strong>{currentChannel?.messageCount || 0}</strong>
                            </p>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowSettings(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Share Channel</h3>
                        <p style={{ color: '#718096', marginBottom: '16px' }}>
                            Share this link to invite others to the channel:
                        </p>
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '16px'
                        }}>
                            <input
                                type="text"
                                value={shareLink}
                                readOnly
                                style={{
                                    flex: 1,
                                    padding: '10px 12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontFamily: 'monospace'
                                }}
                            />
                            <button
                                onClick={copyToClipboard}
                                style={{
                                    padding: '10px 16px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                Copy
                            </button>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowShareModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChannelChat;
