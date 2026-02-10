import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { coursesAPI } from '../services/api';
import { BookOpen, Users, Clock, ArrowRight, PlusCircle } from 'lucide-react';

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

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [myRes, allRes] = await Promise.all([
                coursesAPI.getMyCourses(),
                coursesAPI.getAll()
            ]);
            setMyCourses(myRes.data?.courses || []);
            setAllCourses(allRes.data?.courses || []);
        } catch {
            setError('Failed to load courses.');
        } finally {
            setLoading(false);
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
                                    <div className="mt-4 flex items-center justify-between">
                                        <Link to={`/student/courses/${course._id}`}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4338ca] hover:text-[#312e81]">
                                            Open course <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                        <button onClick={() => handleUnenroll(course._id)} disabled={enrolling === course._id}
                                            className="text-xs text-red-500 hover:text-red-700">
                                            Unenroll
                                        </button>
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
