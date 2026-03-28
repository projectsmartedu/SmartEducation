import React, { useState } from 'react';
import { MessageSquare, Plus, SearchIcon, Settings } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import ChannelChat from '../components/ChannelChat';
import './ChannelsPage.css';

const ChannelsPage = () => {
    const [selectedClass, setSelectedClass] = useState(null);
    const [courses, setCourses] = useState([]);
    const [showChat, setShowChat] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        // Fetch user's courses/classes
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const res = await fetch(process.env.REACT_APP_API_URL + '/api/courses', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data);
                }
            } catch (err) {
                console.error('Error fetching courses:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="channels-page">
                {!showChat ? (
                    <>
                        <div className="channels-header">
                            <div className="header-content">
                                <div className="header-icon">
                                    <MessageSquare size={32} />
                                </div>
                                <div>
                                    <h1>Class Channels</h1>
                                    <p>Communicate with your students through dedicated channels for each class</p>
                                </div>
                            </div>
                            <button className="btn btn-primary">
                                <Plus size={20} /> New Channel
                            </button>
                        </div>

                        <div className="channels-content">
                            <div className="search-box">
                                <SearchIcon size={20} />
                                <input
                                    type="text"
                                    placeholder="Search classes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {loading ? (
                                <div className="loading">Loading classes...</div>
                            ) : filteredCourses.length === 0 ? (
                                <div className="empty-state">
                                    <MessageSquare size={48} />
                                    <h3>No classes found</h3>
                                    <p>You haven't created any classes yet</p>
                                </div>
                            ) : (
                                <div className="classes-grid">
                                    {filteredCourses.map(course => (
                                        <div
                                            key={course._id}
                                            className="class-card"
                                            onClick={() => {
                                                setSelectedClass(course._id);
                                                setShowChat(true);
                                            }}
                                        >
                                            <div className="class-card-header">
                                                <div className="class-icon">
                                                    {course.name?.[0] || 'C'}
                                                </div>
                                                <button className="card-action">
                                                    <Settings size={20} />
                                                </button>
                                            </div>
                                            <div className="class-card-content">
                                                <h3>{course.name}</h3>
                                                <p>{course.description}</p>
                                                <div className="class-stats">
                                                    <span>{course.enrolledStudents?.length || 0} students</span>
                                                </div>
                                            </div>
                                            <div className="class-card-footer">
                                                <button
                                                    className="btn btn-small btn-primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedClass(course._id);
                                                        setShowChat(true);
                                                    }}
                                                >
                                                    <MessageSquare size={16} /> Open Chat
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="chat-view">
                        <ChannelChat
                            classId={selectedClass}
                            onClose={() => {
                                setShowChat(false);
                                setSelectedClass(null);
                            }}
                        />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ChannelsPage;
