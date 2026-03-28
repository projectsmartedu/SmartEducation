import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, SearchIcon, Settings, BookOpen, LogIn } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import ChannelChat from '../components/ChannelChat';
import { coursesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './ChannelsPage.css';

const ChannelsPage = () => {
    const { user } = useAuth();
    const [selectedClass, setSelectedClass] = useState(null);
    const [courses, setCourses] = useState([]);
    const [showChat, setShowChat] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch user's courses/classes
        const fetchCourses = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('📚 Fetching courses for', user?.role, 'user...');
                const res = await coursesAPI.getMyCourses();
                const coursesList = res.data?.courses || [];
                console.log('✅ Found', coursesList.length, 'courses:', coursesList);
                setCourses(coursesList);
            } catch (err) {
                console.error('❌ Error fetching courses:', err);
                setError(err.message || 'Failed to load courses');
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [user]);

    const filteredCourses = courses.filter(course =>
        (course.title || course.name)?.toLowerCase().includes(searchTerm.toLowerCase())
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
                                <div className="loading">⏳ Loading your classes...</div>
                            ) : error ? (
                                <div className="error-state">
                                    <p style={{ color: '#dc2626' }}>❌ {error}</p>
                                </div>
                            ) : filteredCourses.length === 0 ? (
                                <div className="empty-state">
                                    <MessageSquare size={48} />
                                    <h3>
                                        {user?.role === 'teacher'
                                            ? '📚 No courses yet'
                                            : '📖 No enrolled courses'}
                                    </h3>
                                    <p>
                                        {user?.role === 'teacher'
                                            ? 'Create a course to start using channels with your students'
                                            : 'Enroll in a course to join class channels'}
                                    </p>
                                    {user?.role === 'teacher' ? (
                                        <Link to="/teacher/courses" className="btn btn-primary" style={{ marginTop: '20px' }}>
                                            <BookOpen size={16} style={{ marginRight: '8px' }} />
                                            Create Course
                                        </Link>
                                    ) : (
                                        <Link to="/student/courses" className="btn btn-primary" style={{ marginTop: '20px' }}>
                                            <LogIn size={16} style={{ marginRight: '8px' }} />
                                            Browse Courses
                                        </Link>
                                    )}
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
                                                    {(course.title || course.name)?.[0] || 'C'}
                                                </div>
                                                <button className="card-action">
                                                    <Settings size={20} />
                                                </button>
                                            </div>
                                            <div className="class-card-content">
                                                <h3>{course.title || course.name}</h3>
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
