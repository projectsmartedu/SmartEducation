import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    GraduationCap,
    Users2,
    BookOpen,
    ArrowRight,
    TrendingUp,
    TrendingDown,
    Flame,
    Trophy,
    AlertTriangle,
    Search,
    ChevronDown,
    ChevronUp,
    Star,
    Zap,
    Target,
    Award,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { coursesAPI, progressAPI, gamificationAPI } from '../services/api';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [classOverview, setClassOverview] = useState({ students: [], aggregate: {} });
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [classProgress, setClassProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('totalPoints');
    const [sortDir, setSortDir] = useState('desc');
    const [expandedStudent, setExpandedStudent] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [coursesRes, overviewRes] = await Promise.all([
                    coursesAPI.getMyCourses(),
                    gamificationAPI.getClassOverview()
                ]);
                const myCourses = coursesRes.data?.courses || [];
                setCourses(myCourses);
                setClassOverview(overviewRes.data || { students: [], aggregate: {} });

                if (myCourses.length > 0) {
                    setSelectedCourse(myCourses[0]._id);
                }
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    useEffect(() => {
        if (!selectedCourse) return;
        const fetchCourseProgress = async () => {
            try {
                const res = await progressAPI.getClassProgress(selectedCourse);
                setClassProgress(res.data || null);
            } catch {
                setClassProgress(null);
            }
        };
        fetchCourseProgress();
    }, [selectedCourse]);

    const { students, aggregate } = classOverview;

    const totalLearners = useMemo(() =>
        courses.reduce((sum, c) => sum + (c.enrolledStudents?.length ?? 0), 0),
        [courses]);

    const filteredStudents = useMemo(() => {
        let list = [...students];
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(s =>
                s.student?.name?.toLowerCase().includes(q) ||
                s.student?.email?.toLowerCase().includes(q)
            );
        }
        list.sort((a, b) => {
            const aVal = a[sortField] ?? 0;
            const bVal = b[sortField] ?? 0;
            return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
        });
        return list;
    }, [students, searchTerm, sortField, sortDir]);

    const atRiskStudents = useMemo(() =>
        students.filter(s => s.currentStreak < 2 || s.totalPoints < 1000).slice(0, 5),
        [students]);

    const topPerformers = useMemo(() =>
        [...students].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 3),
        [students]);

    const badgeDistribution = useMemo(() => {
        const dist = {};
        students.forEach(s => {
            const key = s.badgeCount ?? 0;
            dist[key] = (dist[key] || 0) + 1;
        });
        return dist;
    }, [students]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <ChevronDown className="ml-1 inline h-3 w-3 opacity-30" />;
        return sortDir === 'desc'
            ? <ChevronDown className="ml-1 inline h-3 w-3 text-[#4338ca]" />
            : <ChevronUp className="ml-1 inline h-3 w-3 text-[#4338ca]" />;
    };

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
                {/* Hero */}
                <section className="rounded-[28px] bg-gradient-to-br from-[#f0f9ff] via-[#fef3c7] to-[#ede9fe] p-6 shadow-xl">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#4338ca]">
                                Student Analytics Hub
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold text-[#0f172a]">
                                Welcome back, {user?.name ?? 'Teacher'}
                            </h1>
                            <p className="mt-1 text-sm text-[#475569]">
                                Monitor student progress, identify at-risk learners, and track gamification across your courses.
                            </p>
                        </div>
                        {topPerformers.length > 0 && (
                            <div className="flex items-center gap-3 rounded-3xl bg-white/80 px-5 py-4 shadow-lg">
                                <Trophy className="h-8 w-8 text-[#f59e0b]" />
                                <div>
                                    <p className="text-xs text-[#94a3b8]">Top performer</p>
                                    <p className="text-sm font-bold text-[#0f172a]">{topPerformers[0]?.student?.name}</p>
                                    <p className="text-xs text-[#4338ca] font-semibold">{topPerformers[0]?.totalPoints?.toLocaleString()} XP</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Stat cards */}
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {[
                        { label: 'Courses', value: courses.length, icon: BookOpen, accent: 'bg-[#ede9fe] text-[#4338ca]', detail: `${courses.filter(c => c.isPublished).length} published` },
                        { label: 'Students', value: totalLearners || aggregate.totalStudents || 0, icon: Users2, accent: 'bg-[#cffafe] text-[#0f766e]', detail: `Across ${courses.length} courses` },
                        { label: 'Avg XP', value: aggregate.averagePoints?.toLocaleString() || '0', icon: Zap, accent: 'bg-[#fef9c3] text-[#92400e]', detail: 'Per student' },
                        { label: 'Avg Streak', value: `${aggregate.averageStreak || 0}d`, icon: Flame, accent: 'bg-[#fee2e2] text-[#dc2626]', detail: 'Activity streak' },
                        { label: 'At Risk', value: atRiskStudents.length, icon: AlertTriangle, accent: 'bg-[#fff7ed] text-[#ea580c]', detail: 'Need attention' }
                    ].map(card => (
                        <div key={card.label} className="flex flex-col rounded-[22px] bg-white p-5 shadow-lg ring-1 ring-[#e2e8f0] transition hover:-translate-y-1">
                            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${card.accent}`}>
                                <card.icon className="h-5 w-5" />
                            </div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-[#94a3b8]">{card.label}</p>
                            <p className="mt-1 text-2xl font-bold text-[#111827]">{card.value}</p>
                            <p className="mt-0.5 text-xs text-[#475569]">{card.detail}</p>
                        </div>
                    ))}
                </section>

                {/* Main grid: Student table + sidebar */}
                <div className="grid gap-6 lg:grid-cols-[1.4fr,0.6fr]">
                    {/* Student analytics table */}
                    <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-[#0f172a]">All Students</h2>
                                <p className="text-xs text-[#94a3b8]">{students.length} students tracked</p>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="rounded-xl border border-[#e2e8f0] py-2 pl-9 pr-4 text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#4338ca] focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20"
                                />
                            </div>
                        </div>

                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[600px] text-sm">
                                <thead>
                                    <tr className="border-b border-[#e2e8f0] text-left text-[10px] uppercase tracking-[0.2em] text-[#94a3b8]">
                                        <th className="pb-3 pr-3">Student</th>
                                        <th className="pb-3 pr-3 cursor-pointer select-none" onClick={() => handleSort('totalPoints')}>
                                            XP <SortIcon field="totalPoints" />
                                        </th>
                                        <th className="pb-3 pr-3 cursor-pointer select-none" onClick={() => handleSort('level')}>
                                            Level <SortIcon field="level" />
                                        </th>
                                        <th className="pb-3 pr-3 cursor-pointer select-none" onClick={() => handleSort('currentStreak')}>
                                            Streak <SortIcon field="currentStreak" />
                                        </th>
                                        <th className="pb-3 pr-3 cursor-pointer select-none" onClick={() => handleSort('lessonsCompleted')}>
                                            Lessons <SortIcon field="lessonsCompleted" />
                                        </th>
                                        <th className="pb-3 pr-3 cursor-pointer select-none" onClick={() => handleSort('badgeCount')}>
                                            Badges <SortIcon field="badgeCount" />
                                        </th>
                                        <th className="pb-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-sm text-[#94a3b8]">
                                                {searchTerm ? 'No students match your search.' : 'No student data available yet.'}
                                            </td>
                                        </tr>
                                    ) : filteredStudents.map(s => {
                                        const isRisk = s.currentStreak < 2 || s.totalPoints < 1000;
                                        const isTop = topPerformers.some(t => t.student?._id === s.student?._id);
                                        const isExpanded = expandedStudent === s.student?._id;
                                        return (
                                            <React.Fragment key={s.student?._id}>
                                                <tr
                                                    className={`border-b border-[#f1f5f9] cursor-pointer transition hover:bg-[#f8fafc] ${isRisk ? 'bg-[#fff7ed]/50' : ''}`}
                                                    onClick={() => setExpandedStudent(isExpanded ? null : s.student?._id)}
                                                >
                                                    <td className="py-3 pr-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${isTop ? 'bg-gradient-to-br from-[#f59e0b] to-[#ef4444]' : isRisk ? 'bg-[#f97316]' : 'bg-[#4338ca]'}`}>
                                                                {(s.student?.name || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-[#0f172a]">{s.student?.name}</p>
                                                                <p className="text-[10px] text-[#94a3b8]">{s.student?.email}</p>
                                                            </div>
                                                            {isTop && <Star className="ml-1 h-3.5 w-3.5 text-[#f59e0b]" />}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 pr-3">
                                                        <span className="font-semibold text-[#4338ca]">{s.totalPoints?.toLocaleString()}</span>
                                                    </td>
                                                    <td className="py-3 pr-3">
                                                        <span className="rounded-full bg-[#ede9fe] px-2.5 py-1 text-xs font-bold text-[#4338ca]">Lv {s.level}</span>
                                                    </td>
                                                    <td className="py-3 pr-3">
                                                        <div className="flex items-center gap-1">
                                                            <Flame className={`h-3.5 w-3.5 ${s.currentStreak >= 7 ? 'text-[#ef4444]' : s.currentStreak >= 3 ? 'text-[#f59e0b]' : 'text-[#d1d5db]'}`} />
                                                            <span className="font-semibold text-[#0f172a]">{s.currentStreak}d</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 pr-3 font-medium text-[#475569]">{s.lessonsCompleted}</td>
                                                    <td className="py-3 pr-3">
                                                        <div className="flex items-center gap-1">
                                                            <Award className="h-3.5 w-3.5 text-[#a78bfa]" />
                                                            <span className="font-medium text-[#475569]">{s.badgeCount}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        {isRisk ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#fee2e2] px-2.5 py-1 text-[10px] font-bold text-[#b91c1c]">
                                                                <ArrowDownRight className="h-3 w-3" /> At Risk
                                                            </span>
                                                        ) : isTop ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-1 text-[10px] font-bold text-[#166534]">
                                                                <ArrowUpRight className="h-3 w-3" /> Top
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#dbeafe] px-2.5 py-1 text-[10px] font-bold text-[#1d4ed8]">
                                                                <TrendingUp className="h-3 w-3" /> Active
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr className="bg-[#f8fafc]">
                                                        <td colSpan={7} className="px-4 py-4">
                                                            <div className="grid gap-3 sm:grid-cols-4">
                                                                <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-[#e2e8f0]">
                                                                    <p className="text-[10px] uppercase tracking-widest text-[#94a3b8]">Revisions Done</p>
                                                                    <p className="mt-1 text-xl font-bold text-[#0f172a]">{s.revisionsCompleted}</p>
                                                                </div>
                                                                <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-[#e2e8f0]">
                                                                    <p className="text-[10px] uppercase tracking-widest text-[#94a3b8]">Total Points</p>
                                                                    <p className="mt-1 text-xl font-bold text-[#4338ca]">{s.totalPoints?.toLocaleString()}</p>
                                                                </div>
                                                                <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-[#e2e8f0]">
                                                                    <p className="text-[10px] uppercase tracking-widest text-[#94a3b8]">Longest Streak</p>
                                                                    <p className="mt-1 text-xl font-bold text-[#ef4444]">—</p>
                                                                </div>
                                                                <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-[#e2e8f0]">
                                                                    <p className="text-[10px] uppercase tracking-widest text-[#94a3b8]">Engagement</p>
                                                                    <div className="mt-1 h-2 rounded-full bg-[#e2e8f0]">
                                                                        <div className="h-2 rounded-full bg-gradient-to-r from-[#4338ca] to-[#0ea5e9]"
                                                                            style={{ width: `${Math.min(100, Math.round((s.totalPoints / (aggregate.averagePoints || 1)) * 50))}%` }} />
                                                                    </div>
                                                                    <p className="mt-1 text-xs text-[#64748b]">
                                                                        {s.totalPoints > (aggregate.averagePoints || 0) ? 'Above avg' : 'Below avg'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Sidebar: At-risk + badge distribution */}
                    <div className="space-y-6">
                        {/* At-risk students */}
                        <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="h-5 w-5 text-[#ea580c]" />
                                <h2 className="text-lg font-semibold text-[#0f172a]">At-Risk Students</h2>
                            </div>
                            {atRiskStudents.length === 0 ? (
                                <p className="py-4 text-center text-sm text-[#94a3b8]">All students are on track! 🎉</p>
                            ) : (
                                <div className="space-y-2">
                                    {atRiskStudents.map(s => (
                                        <div key={s.student?._id} className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#fff7ed] to-[#fef2f2] p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f97316] text-[10px] font-bold text-white">
                                                    {(s.student?.name || 'S')[0]}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-[#0f172a]">{s.student?.name}</p>
                                                    <p className="text-[10px] text-[#94a3b8]">
                                                        {s.currentStreak < 2 ? `${s.currentStreak}d streak` : `${s.totalPoints} XP`}
                                                    </p>
                                                </div>
                                            </div>
                                            <TrendingDown className="h-4 w-4 text-[#ef4444]" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Badge distribution */}
                        <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="h-5 w-5 text-[#a78bfa]" />
                                <h2 className="text-lg font-semibold text-[#0f172a]">Badge Distribution</h2>
                            </div>
                            <div className="space-y-2">
                                {Object.entries(badgeDistribution).sort((a, b) => Number(a[0]) - Number(b[0])).map(([count, studentsWithCount]) => (
                                    <div key={count} className="flex items-center gap-3">
                                        <span className="w-16 text-xs font-semibold text-[#475569]">{count} badge{count !== '1' ? 's' : ''}</span>
                                        <div className="flex-1 h-5 rounded-full bg-[#f1f5f9] overflow-hidden">
                                            <div className="h-full rounded-full bg-gradient-to-r from-[#a78bfa] to-[#4338ca] transition-all"
                                                style={{ width: `${Math.round((studentsWithCount / students.length) * 100)}%` }} />
                                        </div>
                                        <span className="w-8 text-right text-xs font-bold text-[#4338ca]">{studentsWithCount}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Top 3 */}
                        <section className="rounded-[28px] bg-gradient-to-br from-[#ede9fe] to-[#fef9c3] p-5 shadow-xl">
                            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">🏆 Top Performers</h2>
                            <div className="space-y-2">
                                {topPerformers.map((s, i) => (
                                    <div key={s.student?._id} className="flex items-center justify-between rounded-2xl bg-white/80 p-3 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{['🥇', '🥈', '🥉'][i]}</span>
                                            <div>
                                                <p className="text-sm font-semibold text-[#0f172a]">{s.student?.name}</p>
                                                <p className="text-[10px] text-[#94a3b8]">Lv {s.level} • {s.badgeCount} badges</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-[#4338ca]">{s.totalPoints?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Course topic progress */}
                <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-semibold text-[#0f172a]">Course Topic Progress</h2>
                            <p className="text-xs text-[#94a3b8]">Topic-level completion across your students</p>
                        </div>
                        <select
                            value={selectedCourse || ''}
                            onChange={e => setSelectedCourse(e.target.value)}
                            className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-2 text-sm text-[#0f172a] focus:border-[#4338ca] focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20"
                        >
                            {courses.map(c => (
                                <option key={c._id} value={c._id}>{c.title}</option>
                            ))}
                        </select>
                    </div>

                    {!classProgress?.topicAverages?.length ? (
                        <div className="rounded-3xl bg-[#f1f5f9] p-8 text-center text-sm text-[#64748b]">
                            <Target className="mx-auto h-8 w-8 text-[#94a3b8] mb-2" />
                            No progress data yet for this course. Students need to start learning.
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {classProgress.topicAverages.map(t => {
                                    const pct = Math.round((t.averageMastery ?? 0) * 100);
                                    const color = pct >= 70 ? 'from-[#22c55e] to-[#16a34a]'
                                        : pct >= 40 ? 'from-[#f59e0b] to-[#d97706]'
                                            : 'from-[#ef4444] to-[#dc2626]';
                                    const bg = pct >= 70 ? 'bg-[#dcfce7]' : pct >= 40 ? 'bg-[#fef9c3]' : 'bg-[#fee2e2]';
                                    return (
                                        <div key={t.topic || t.title} className={`rounded-2xl ${bg} p-4 transition hover:-translate-y-1 hover:shadow-lg`}>
                                            <p className="text-sm font-semibold text-[#0f172a] truncate">{t.title || t.topic}</p>
                                            <div className="mt-3 h-2.5 rounded-full bg-white/60">
                                                <div className={`h-2.5 rounded-full bg-gradient-to-r ${color}`} style={{ width: `${pct}%` }} />
                                            </div>
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-xs text-[#475569]">{pct}% mastery</span>
                                                <span className="text-xs text-[#94a3b8]">{t.studentsWithProgress || 0} students</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Student summaries for selected course */}
                            {classProgress.studentSummaries?.length > 0 && (
                                <div className="mt-5">
                                    <h3 className="text-sm font-semibold text-[#475569] mb-3">Student Progress in this Course</h3>
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                        {classProgress.studentSummaries.map(s => {
                                            const m = Math.round((s.averageMastery ?? 0) * 100);
                                            return (
                                                <div key={s.studentId} className="flex items-center gap-3 rounded-xl bg-[#f8fafc] p-3 ring-1 ring-[#e2e8f0]">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4338ca] text-xs font-bold text-white">
                                                        {(s.studentName || 'S')[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-[#0f172a] truncate">{s.studentName}</p>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <div className="flex-1 h-1.5 rounded-full bg-[#e2e8f0]">
                                                                <div className="h-1.5 rounded-full bg-[#4338ca]" style={{ width: `${m}%` }} />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-[#4338ca]">{m}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* Quick actions */}
                <section className="grid gap-4 sm:grid-cols-3">
                    <Link to="/teacher/courses" className="group flex items-center gap-4 rounded-[22px] bg-white p-5 shadow-lg ring-1 ring-[#e2e8f0] transition hover:-translate-y-1 hover:shadow-xl">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ede9fe] text-[#4338ca]">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-[#0f172a]">Manage Courses</p>
                            <p className="text-xs text-[#94a3b8]">Create, edit, add topics</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#94a3b8] transition group-hover:text-[#4338ca]" />
                    </Link>
                    <Link to="/teacher/students" className="group flex items-center gap-4 rounded-[22px] bg-white p-5 shadow-lg ring-1 ring-[#e2e8f0] transition hover:-translate-y-1 hover:shadow-xl">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#cffafe] text-[#0f766e]">
                            <Users2 className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-[#0f172a]">Manage Students</p>
                            <p className="text-xs text-[#94a3b8]">View rosters, grades</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#94a3b8] transition group-hover:text-[#4338ca]" />
                    </Link>
                    <Link to="/teacher/materials" className="group flex items-center gap-4 rounded-[22px] bg-white p-5 shadow-lg ring-1 ring-[#e2e8f0] transition hover:-translate-y-1 hover:shadow-xl">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fef9c3] text-[#92400e]">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-[#0f172a]">Course Materials</p>
                            <p className="text-xs text-[#94a3b8]">Upload resources</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#94a3b8] transition group-hover:text-[#4338ca]" />
                    </Link>
                </section>
            </div>
        </DashboardLayout>
    );
};

export default TeacherDashboard;
