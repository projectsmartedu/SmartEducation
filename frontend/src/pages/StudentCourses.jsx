import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { coursesAPI, progressAPI } from '../services/api';
import { BookOpen, Users, Clock, ArrowRight, PlusCircle, WifiOff, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DownloadForOffline from '../components/DownloadForOffline';
import {
    saveCourseOffline,
    getAllCoursesOffline,
    removeCourseOffline,
    saveProgressOffline
} from '../services/offlineStorage';

const DIFFICULTY_STYLES = {
    beginner: 'bg-[#dcfce7] text-[#166534]',
    intermediate: 'bg-[#fef9c3] text-[#92400e]',
    advanced: 'bg-[#fee2e2] text-[#991b1b]'
};

const StudentCourses = () => {
    const [myCourses, setMyCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(null);
    const [error, setError] = useState('');
    const [offlineMode, setOfflineMode] = useState(false);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        if (!navigator.onLine) {
            // Load from offline storage
            try {
                const offlineCourses = await getAllCoursesOffline();
                setMyCourses(offlineCourses);
                setAllCourses([]);
                setOfflineMode(true);
            } catch {
                setError('Failed to load offline courses.');
            } finally {
                setLoading(false);
            }
            return;
        }
        try {
            const [myRes, allRes] = await Promise.all([
                coursesAPI.getMyCourses(),
                coursesAPI.getAll()
            ]);
            setMyCourses(myRes.data?.courses || []);
            setAllCourses(allRes.data?.courses || []);
            setOfflineMode(false);
        } catch {
            // Fallback to offline on network error
            try {
                const offlineCourses = await getAllCoursesOffline();
                if (offlineCourses.length > 0) {
                    setMyCourses(offlineCourses);
                    setAllCourses([]);
                    setOfflineMode(true);
                } else {
                    setError('Failed to load courses.');
                }
            } catch {
                setError('Failed to load courses.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCourse = async (course) => {
        try {
            // Fetch topics for the course
            const topicsRes = await coursesAPI.getById(course._id);
            const topics = topicsRes.data?.topics || [];

            // Fetch all topic contents
            const topicContents = [];
            for (const topic of topics) {
                try {
                    const contentRes = await coursesAPI.getTopicContent(course._id, topic._id);
                    topicContents.push({ topicId: topic._id, content: contentRes.data });
                } catch {
                    // Skip topics that fail to load
                }
            }

            await saveCourseOffline(course, topics, topicContents);

            // Also save current progress for offline use
            try {
                const progressRes = await progressAPI.getCourseProgress(course._id);
                const progressArr = progressRes.data?.progress || [];
                if (progressArr.length > 0) {
                    const progressItems = progressArr.map(p => ({
                        _id: p._id || `progress_${p.topic?._id || p.topic}`,
                        topic: p.topic?._id || p.topic,
                        courseId: course._id,
                        status: p.status,
                        masteryLevel: p.masteryLevel,
                        timeSpentMinutes: p.timeSpentMinutes
                    }));
                    await saveProgressOffline(progressItems);
                }
            } catch {
                // Progress save failed, course content still saved
            }
        } catch (err) {
            throw new Error('Failed to download course');
        }
    };

    const enrolledIds = new Set(myCourses.map(c => c._id));

    const handleEnroll = async (courseId) => {
        setEnrolling(courseId);
        try {
            await coursesAPI.enroll(courseId);
            await fetchAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to enroll.');
        } finally {
            setEnrolling(null);
        }
    };

    const handleUnenroll = async (courseId) => {
        if (!window.confirm('Unenroll from this course?')) return;
        setEnrolling(courseId);
        try {
            await coursesAPI.unenroll(courseId);
            await fetchAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to unenroll.');
        } finally {
            setEnrolling(null);
        }
    };

    const availableCourses = allCourses.filter(c => !enrolledIds.has(c._id) && c.isPublished);

    const navigate = useNavigate();

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-24">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e2e8f0] border-t-[#4338ca]" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                    <h1 className="text-2xl font-semibold text-[#0f172a]">My Courses</h1>
                    <p className="mt-1 text-sm text-[#475569]">View enrolled courses, track progress, and discover new ones.</p>
                </section>

                {offlineMode && (
                    <div className="rounded-2xl bg-[#fef3c7] p-4 text-sm text-[#92400e] flex items-center gap-2">
                        <WifiOff className="h-4 w-4" />
                        Showing downloaded courses (offline mode)
                    </div>
                )}

                {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

                {/* Enrolled courses */}
                <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                    <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Enrolled ({myCourses.length})</h2>
                    {myCourses.length === 0 ? (
                        <p className="py-8 text-center text-sm text-[#94a3b8]">You haven't enrolled in any courses yet. Browse available courses below.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {myCourses.map(course => (
                                <div key={course._id} className="rounded-3xl border border-[#e2e8f0] bg-[#f8fafc] p-5 transition hover:-translate-y-1 hover:shadow-xl">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-[#0f172a]">{course.title}</h3>
                                            <p className="mt-0.5 text-xs text-[#64748b]">{course.subject}</p>
                                        </div>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_STYLES[course.difficulty] || DIFFICULTY_STYLES.intermediate}`}>
                                            {course.difficulty}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex gap-3 text-xs text-[#94a3b8]">
                                        <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {course.topicCount ?? 0} topics</span>
                                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {course.estimatedHours}h</span>
                                    </div>
                                    <div className="mt-3">
                                        <DownloadForOffline
                                            type="course"
                                            entityId={course._id}
                                            onDownload={() => handleDownloadCourse(course)}
                                            onRemove={() => removeCourseOffline(course._id)}
                                            size="md"
                                        />
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Link to={`/student/courses/${course._id}`}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#4338ca] hover:text-[#312e81]">
                                                Open course <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                            <button onClick={() => {
                                                const params = new URLSearchParams();
                                                if (course.subject) params.set('subject', course.subject);
                                                navigate(`/student/doubt-support?${params.toString()}`);
                                            }} className="inline-flex items-center gap-1 text-xs font-semibold text-[#4338ca] hover:text-[#312e81]">
                                                <MessageSquare className="h-4 w-4" /> Ask AI
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!offlineMode && (
                                                <button onClick={() => handleUnenroll(course._id)} disabled={enrolling === course._id}
                                                    className="text-xs text-red-500 hover:text-red-700">
                                                    Unenroll
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Available courses */}
                {availableCourses.length > 0 && (
                    <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                        <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Discover Courses ({availableCourses.length})</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {availableCourses.map(course => (
                                <div key={course._id} className="rounded-3xl border border-[#e2e8f0] bg-[#f8fafc] p-5 transition hover:-translate-y-1 hover:shadow-xl">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-[#0f172a]">{course.title}</h3>
                                            <p className="mt-0.5 text-xs text-[#64748b]">{course.subject}</p>
                                        </div>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_STYLES[course.difficulty] || DIFFICULTY_STYLES.intermediate}`}>
                                            {course.difficulty}
                                        </span>
                                    </div>
                                    {course.description && (
                                        <p className="mt-2 text-xs text-[#475569] line-clamp-2">{course.description}</p>
                                    )}
                                    <div className="mt-3 flex gap-3 text-xs text-[#94a3b8]">
                                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.enrolledStudents?.length || 0} enrolled</span>
                                        <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {course.topicCount ?? 0} topics</span>
                                    </div>
                                    <button onClick={() => handleEnroll(course._id)} disabled={enrolling === course._id}
                                        className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-full bg-[#4338ca] px-4 py-2 text-xs font-semibold text-white hover:bg-[#312e81] disabled:opacity-50">
                                        {enrolling === course._id ? 'Enrolling...' : <><PlusCircle className="h-3.5 w-3.5" /> Enroll</>}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentCourses;
