import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import FloatingChatButton from '../components/FloatingChatButton';
import { useAuth } from '../context/AuthContext';
import {
    BookOpen,
    CheckCircle,
    CheckCircle2,
    Clock,
    ArrowRight,
    Award,
    Sparkles,
    Zap,
    Target,
    Trophy,
    Brain,
    Flame,
    GraduationCap,
    AlertTriangle,
    BookText,
    Rocket
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { progressAPI, revisionsAPI, gamificationAPI, coursesAPI } from '../services/api';

const BADGE_ACCENT_MAP = {
    streak: 'bg-[#fff7ed] border-[#fed7aa]',
    mastery: 'bg-[#f5f3ff] border-[#ddd6fe]',
    revision: 'bg-[#ecfeff] border-[#a5f3fc]',
    milestone: 'bg-[#f0fdf4] border-[#bbf7d0]',
    special: 'bg-[#fdf2f8] border-[#fbcfe8]',
    speed: 'bg-[#fff7ed] border-[#fdba74]'
};

const BADGE_ICON_MAP = {
    sword: Rocket,
    medal: Award,
    crown: Trophy,
    flame: Flame,
    biceps: Target,
    star: Sparkles,
    sparkles: Sparkles,
    gem: Award,
    trophy: Trophy,
    rocket: Rocket,
    book: BookOpen,
    graduation: GraduationCap,
    bolt: Zap,
    brain: Brain
};

const StudentDashboard = () => {
    const { user } = useAuth();
    const [myCourses, setMyCourses] = useState([]);
    const [courseProgress, setCourseProgress] = useState({});
    const [revisionPlan, setRevisionPlan] = useState([]);
    const [gamification, setGamification] = useState(null);
    const [progressStats, setProgressStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chatVisible, setChatVisible] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [coursesRes, revsRes, gamRes, statsRes] = await Promise.all([
                    coursesAPI.getMyCourses(),
                    revisionsAPI.getMyRevisions({ status: 'pending,overdue', limit: 5 }),
                    gamificationAPI.getMyProfile(),
                    progressAPI.getStats()
                ]);

                const enrolled = coursesRes.data?.courses || [];
                setMyCourses(enrolled);

                // Fetch progress for each enrolled course
                const progressMap = {};
                await Promise.all(
                    enrolled.slice(0, 6).map(async (course) => {
                        try {
                            const progRes = await progressAPI.getCourseProgress(course._id);
                            const progData = progRes.data;
                            const total = progData?.summary?.totalTopics || 0;
                            const completed = progData?.summary?.completedTopics || 0;
                            progressMap[course._id] = {
                                totalTopics: total,
                                completedTopics: completed,
                                percent: total > 0 ? Math.round((completed / total) * 100) : 0
                            };
                        } catch { /* skip */ }
                    })
                );
                setCourseProgress(progressMap);

                // Revisions
                const revisions = revsRes.data?.revisions || [];
                setRevisionPlan(
                    revisions.map((r) => {
                        const scheduledDate = new Date(r.scheduledFor);
                        const today = new Date();
                        const diffDays = Math.ceil((scheduledDate - today) / (1000 * 60 * 60 * 24));
                        const next = diffDays <= 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : scheduledDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                        return {
                            concept: r.topic?.title || 'Topic',
                            courseName: r.course?.title || '',
                            priority: r.priority,
                            next,
                            isUrgent: diffDays <= 0
                        };
                    })
                );

                setGamification(gamRes.data?.profile || null);
                setProgressStats(statsRes.data || null);
            } catch {
                // gracefully degrade
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const xp = gamification?.totalPoints ?? 0;
    const level = gamification?.level ?? 1;
    const streakDays = gamification?.currentStreak ?? 0;
    const lessonsCompleted = gamification?.lessonsCompleted ?? 0;
    const totalTopics = progressStats?.totalTopics ?? 0;
    const completedTopics = (progressStats?.completed ?? 0) + (progressStats?.mastered ?? 0);
    const overallPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?';
    const streakLabel = `${streakDays || 0} day${streakDays === 1 ? '' : 's'} streak`;

    const badges = useMemo(() => {
        if (!gamification?.badges?.length) return [];
        return gamification.badges.map((b) => ({
            title: b.name,
            description: b.description,
            icon: b.icon || 'trophy',
            gradient: BADGE_ACCENT_MAP[b.category] || BADGE_ACCENT_MAP.milestone
        }));
    }, [gamification]);

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
                {/* Welcome Header */}
                <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-7">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4338ca] text-lg font-semibold text-white sm:h-14 sm:w-14">
                                {initial}
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-[0.18em] text-[#64748b]">Dashboard</p>
                                <h1 className="text-2xl font-semibold text-[#0f172a] sm:text-3xl">Welcome back, {user?.name ?? 'Learner'}</h1>
                                <p className="text-sm text-[#64748b]">Track your courses, revisions, and progress in one place.</p>
                            </div>
                        </div>
                        <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-3">
                            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#0f172a]">
                                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Level</p>
                                <p className="mt-1 text-base">{level}</p>
                            </div>
                            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#0f172a]">
                                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Total XP</p>
                                <p className="mt-1 text-base">{xp.toLocaleString()}</p>
                            </div>
                            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-[#0f172a]">
                                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Streak</p>
                                <p className="mt-1 text-base">{streakLabel}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-[#64748b] sm:max-w-xl">
                            {completedTopics > 0
                                ? `You've completed ${completedTopics} of ${totalTopics} topics. Keep the momentum going!`
                                : 'Enroll in a course and start learning to build your mastery map.'}
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Link to="/student/courses"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4338ca] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3730a3]">
                                <BookOpen className="h-4 w-4" /> <span>Browse Courses</span>
                            </Link>
                            <Link to="/student/leaderboard"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d1d5db] px-4 py-2 text-sm font-semibold text-[#334155] transition hover:bg-[#f8fafc]">
                                <Trophy className="h-4 w-4" /> <span>Leaderboard</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Stats Cards */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-[#64748b]">Total XP</p>
                                <p className="mt-1 text-2xl font-bold text-[#0f172a]">{xp.toLocaleString()}</p>
                            </div>
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fef3c7]"><Zap className="h-5 w-5 text-[#d97706]" /></span>
                        </div>
                    </div>
                    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-[#64748b]">Level</p>
                                <p className="mt-1 text-2xl font-bold text-[#4338ca]">{level}</p>
                            </div>
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ede9fe]"><Brain className="h-5 w-5 text-[#4338ca]" /></span>
                        </div>
                    </div>
                    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-[#64748b]">Streak</p>
                                <p className="mt-1 text-2xl font-bold text-[#f59e0b]">{streakDays} days</p>
                            </div>
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff7ed]"><Flame className="h-5 w-5 text-[#ea580c]" /></span>
                        </div>
                    </div>
                    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-[#64748b]">Completed</p>
                                <p className="mt-1 text-2xl font-bold text-[#16a34a]">{lessonsCompleted}</p>
                            </div>
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dcfce7]"><CheckCircle2 className="h-5 w-5 text-[#15803d]" /></span>
                        </div>
                    </div>
                </section>

                {/* My Courses Progress */}
                <section className="rounded-[24px] border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-[#0f172a]">My Courses</h2>
                            <p className="text-sm text-[#64748b]">Continue where you left off</p>
                        </div>
                        <Link to="/student/courses" className="flex items-center gap-1 text-sm font-semibold text-[#4338ca] transition hover:text-[#312e81]">
                            View all <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {myCourses.length === 0 ? (
                        <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-10 text-center">
                            <BookOpen className="mx-auto h-12 w-12 text-[#cbd5e1]" />
                            <h3 className="mt-4 font-semibold text-[#475569]">No courses yet</h3>
                            <p className="mt-1 text-sm text-[#94a3b8]">Explore available courses and enroll to start learning.</p>
                            <Link to="/student/courses" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#4338ca] px-5 py-2 text-sm font-semibold text-white hover:bg-[#312e81]">
                                Browse Courses
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {myCourses.slice(0, 6).map(course => {
                                const prog = courseProgress[course._id] || { totalTopics: 0, completedTopics: 0, percent: 0 };
                                const isComplete = prog.percent === 100 && prog.totalTopics > 0;
                                return (
                                    <Link key={course._id} to={`/student/courses/${course._id}`}
                                        className="group rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-5 transition hover:border-[#cbd5e1] hover:bg-white">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-sm font-semibold text-[#0f172a] group-hover:text-[#4338ca]">{course.title}</h3>
                                                <p className="mt-0.5 text-xs text-[#64748b]">{course.subject}</p>
                                            </div>
                                            {isComplete && <GraduationCap className="h-4 w-4 text-[#16a34a]" />}
                                        </div>
                                        <div className="mt-4 flex items-center gap-3 text-xs text-[#94a3b8]">
                                            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.topicCount ?? prog.totalTopics} topics</span>
                                            <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {prog.completedTopics} done</span>
                                        </div>
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-[#64748b]">Progress</span>
                                                <span className="font-semibold text-[#4338ca]">{prog.percent}%</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-[#e2e8f0]">
                                                <div className={`h-2 rounded-full transition-all ${isComplete ? 'bg-[#16a34a]' : 'bg-[#4338ca]'}`}
                                                    style={{ width: `${prog.percent}%` }} />
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#4338ca] opacity-0 group-hover:opacity-100 transition">
                                            {isComplete ? 'Review' : prog.completedTopics > 0 ? 'Continue' : 'Start'} <ArrowRight className="h-3.5 w-3.5" />
                                        </div>

                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                    {/* Overall Progress */}
                    <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-[#0f172a]">Overall Progress</h2>
                        <div className="mt-5 space-y-4">
                            <div className="rounded-2xl bg-[#f8fafc] p-4">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                                        <Target className="h-4 w-4 text-[#4338ca]" /> Topics Completed
                                    </span>
                                    <span className="text-sm font-bold text-[#4338ca]">{completedTopics}/{totalTopics}</span>
                                </div>
                                <div className="mt-3 h-2.5 rounded-full bg-[#e2e8f0]">
                                    <div className="h-2.5 rounded-full bg-gradient-to-r from-[#4338ca] to-[#0ea5e9]"
                                        style={{ width: `${overallPercent}%` }} />
                                </div>
                            </div>
                            <div className="rounded-2xl bg-[#f8fafc] p-4">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                                        <Zap className="h-4 w-4 text-[#f59e0b]" /> XP to Next Level
                                    </span>
                                    <span className="text-sm font-bold text-[#f59e0b]">{xp % 1000}/1000</span>
                                </div>
                                <div className="mt-3 h-2.5 rounded-full bg-[#e2e8f0]">
                                    <div className="h-2.5 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#ef4444]"
                                        style={{ width: `${(xp % 1000) / 10}%` }} />
                                </div>
                            </div>
                            {progressStats?.courseBreakdown?.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-[#64748b] mb-3">Per Course</p>
                                    <div className="space-y-2">
                                        {progressStats.courseBreakdown.map(cb => (
                                            <div key={cb.course} className="flex items-center gap-3">
                                                <span className="text-xs text-[#0f172a] font-medium w-28 truncate">{cb.courseName}</span>
                                                <div className="flex-1 h-2 rounded-full bg-[#e2e8f0]">
                                                    <div className="h-2 rounded-full bg-[#4338ca]"
                                                        style={{ width: `${Math.round((cb.averageMastery || 0) * 100)}%` }} />
                                                </div>
                                                <span className="text-xs font-semibold text-[#4338ca] w-10 text-right">{Math.round((cb.averageMastery || 0) * 100)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Badge Cabinet */}
                    <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-lg font-semibold text-[#0f172a]">Badge Cabinet</h2>
                            <Link to="/student/leaderboard" className="text-sm font-semibold text-[#4338ca] hover:text-[#312e81]">
                                View all
                            </Link>
                        </div>
                        {badges.length === 0 ? (
                            <div className="mt-6 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-8 text-center">
                                <Award className="mx-auto h-10 w-10 text-[#cbd5e1]" />
                                <p className="mt-3 text-sm font-medium text-[#475569]">No badges yet</p>
                                <p className="mt-1 text-xs text-[#94a3b8]">Complete topics and maintain streaks to earn badges!</p>
                            </div>
                        ) : (
                            <div className="mt-5 grid grid-cols-2 gap-3">
                                {badges.slice(0, 6).map((badge, i) => {
                                    const BadgeIcon = BADGE_ICON_MAP[badge.icon] || Trophy;
                                    return (
                                        <div key={badge.title}
                                            className={`group rounded-xl border ${badge.gradient} p-4 text-center shadow-sm transition hover:border-[#cbd5e1]`}>
                                            <span className="flex justify-center">
                                                <BadgeIcon className="h-8 w-8 text-[#0f172a]" />
                                            </span>
                                            <p className="mt-2 text-xs font-bold text-[#0f172a]">{badge.title}</p>
                                            <p className="text-[10px] text-[#64748b]">{badge.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* Pending Revisions */}
                {revisionPlan.length > 0 && (
                    <section className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-lg font-semibold text-[#0f172a]">Upcoming Revisions</h2>
                            <Link to="/student/revisions" className="flex items-center gap-1 text-sm font-semibold text-[#4338ca] hover:text-[#312e81]">
                                View all <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {revisionPlan.map((rev, i) => (
                                <div key={i} className="flex flex-col gap-3 rounded-2xl bg-[#f8fafc] p-4 transition hover:bg-[#f1f5f9] sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${rev.isUrgent ? 'bg-[#fee2e2] text-[#b91c1c]' : 'bg-[#ede9fe] text-[#4338ca]'}`}>
                                            {rev.isUrgent ? <AlertTriangle className="h-4 w-4" /> : <BookText className="h-4 w-4" />}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-[#0f172a]">{rev.concept}</p>
                                            <p className="text-xs capitalize text-[#94a3b8]">{rev.priority} priority</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold text-[#475569] sm:text-right">
                                        <p className={rev.isUrgent ? 'text-[#b91c1c]' : ''}>{rev.next}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Quick Actions */}
                <section className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="mb-4 text-lg font-semibold text-[#0f172a]">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        <Link to="/student/courses" className="flex flex-col items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-5 text-center transition hover:bg-white">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ede9fe]"><BookOpen className="h-5 w-5 text-[#4338ca]" /></span>
                            <span className="text-xs font-semibold text-[#334155]">My Courses</span>
                        </Link>
                        <Link to="/student/materials" className="flex flex-col items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-5 text-center transition hover:bg-white">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fef3c7]"><Sparkles className="h-5 w-5 text-[#92400e]" /></span>
                            <span className="text-xs font-semibold text-[#334155]">Materials</span>
                        </Link>
                        <Link to="/student/revisions" className="flex flex-col items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-5 text-center transition hover:bg-white">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#cffafe]"><Clock className="h-5 w-5 text-[#0e7490]" /></span>
                            <span className="text-xs font-semibold text-[#334155]">Revisions</span>
                        </Link>
                        {/* Doubt Support removed - use topic-scoped chat inside courses */}
                    </div>
                </section>
            </div>
            <FloatingChatButton onActivate={() => setChatVisible(!chatVisible)} />
        </DashboardLayout>
    );
};

export default StudentDashboard;
