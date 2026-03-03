import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { revisionsAPI, aiAPI, coursesAPI } from '../services/api';

const StudentRevisions = () => {
    const [revisionSchedule, setRevisionSchedule] = useState([]);
    const [stats, setStats] = useState(null);
    const [adaptiveQueue, setAdaptiveQueue] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRevisions = useCallback(async (courseId) => {
        setLoading(true);
        try {
            const [revRes, statsRes, adaptiveRes] = await Promise.all([
                revisionsAPI.getMyRevisions({ status: 'pending,overdue' }),
                revisionsAPI.getStats(),
                aiAPI.getRecommendations(courseId ? { courseId } : {})
            ]);
            const revisions = revRes.data?.revisions || [];
            setRevisionSchedule(
                revisions.map((r) => ({
                    _id: r._id,
                    concept: r.topic?.title || 'Unknown topic',
                    due: new Date(r.scheduledFor).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    risk: r.priority === 'critical' ? 'High' : r.priority === 'high' ? 'High' : r.priority === 'medium' ? 'Medium' : 'Low',
                    notes: `${r.type?.replace('_', ' ')} revision • ${r.course?.title || 'Course'}`,
                    status: r.status
                }))
            );
            setAdaptiveQueue(adaptiveRes.data?.adaptivePlan?.revisionQueue || []);
            setStats(statsRes.data || null);
        } catch {
            setError('Failed to load revisions.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const boot = async () => {
            try {
                const res = await coursesAPI.getMyCourses();
                const list = res.data?.courses || [];
                setCourses(list);
                const first = list[0]?._id || '';
                setSelectedCourse(first);
                fetchRevisions(first);
            } catch {
                fetchRevisions();
            }
        };
        boot();
    }, [fetchRevisions]);

    const handleComplete = async (id) => {
        try {
            await revisionsAPI.complete(id, { score: 80 });
            fetchRevisions(selectedCourse);
        } catch {
            setError('Failed to complete revision.');
        }
    };

    const handleSkip = async (id) => {
        try {
            await revisionsAPI.skip(id);
            fetchRevisions(selectedCourse);
        } catch {
            setError('Failed to skip revision.');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                    <h1 className="text-2xl font-semibold text-[#0f172a]">Adaptive Revision Planner</h1>
                    <p className="mt-2 text-sm text-[#475569]">
                        Revision slots and priorities are generated from a per-topic ML risk score to keep your schedule adaptive.
                    </p>
                    {courses.length > 1 && (
                        <select
                            className="mt-4 rounded-xl border border-[#e2e8f0] px-4 py-2 text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#4338ca]"
                            value={selectedCourse}
                            onChange={(e) => {
                                setSelectedCourse(e.target.value);
                                fetchRevisions(e.target.value);
                            }}
                        >
                            {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                        </select>
                    )}
                    {stats && (
                        <div className="mt-4 flex flex-wrap gap-4">
                            <div className="rounded-2xl bg-[#f8fafc] px-4 py-2"><span className="text-xs uppercase tracking-widest text-[#64748b]">Pending</span><p className="text-lg font-semibold text-[#111827]">{stats.pending ?? 0}</p></div>
                            <div className="rounded-2xl bg-[#f8fafc] px-4 py-2"><span className="text-xs uppercase tracking-widest text-[#64748b]">Completed</span><p className="text-lg font-semibold text-[#166534]">{stats.completed ?? 0}</p></div>
                            <div className="rounded-2xl bg-[#f8fafc] px-4 py-2"><span className="text-xs uppercase tracking-widest text-[#64748b]">Overdue</span><p className="text-lg font-semibold text-[#b91c1c]">{stats.overdue ?? 0}</p></div>
                            <div className="rounded-2xl bg-[#f8fafc] px-4 py-2"><span className="text-xs uppercase tracking-widest text-[#64748b]">Avg Score</span><p className="text-lg font-semibold text-[#4338ca]">{stats.averageScore ? `${Math.round(stats.averageScore)}%` : '—'}</p></div>
                        </div>
                    )}
                </section>

                {error && <div className="rounded-2xl bg-[#fee2e2] p-4 text-sm text-[#b91c1c]">{error}</div>}

                <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#64748b]">ML Generated Priority Queue</h2>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        {adaptiveQueue.map((item) => (
                            <div key={String(item.topicId)} className="rounded-2xl bg-[#f8fafc] p-4">
                                <p className="text-sm font-semibold text-[#111827]">{item.concept}</p>
                                <p className="mt-1 text-xs text-[#64748b]">Risk {Math.round((item.riskScore || 0) * 100)}%</p>
                                <p className="mt-1 text-xs text-[#64748b]">Type: {item.suggestedRevisionType}</p>
                                <p className="mt-1 text-xs text-[#64748b]">Due: {new Date(item.scheduledFor).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e2e8f0] border-t-[#4338ca]" /></div>
                    ) : revisionSchedule.length === 0 ? (
                        <p className="py-8 text-center text-sm text-[#94a3b8]">No pending revisions. Great job staying on track!</p>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-[#e2e8f0]">
                            <table className="w-full text-sm text-[#334155]"><thead className="bg-[#f8fafc] text-xs uppercase tracking-[0.18em] text-[#64748b]"><tr><th className="px-4 py-3 text-left">Concept</th><th className="px-4 py-3 text-left">Due</th><th className="px-4 py-3 text-left">Risk</th><th className="px-4 py-3 text-left">Notes</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                                <tbody>
                                    {revisionSchedule.map((slot) => (
                                        <tr key={slot._id} className="border-t border-[#e2e8f0] bg-white transition hover:bg-[#f8fafc]">
                                            <td className="px-4 py-3 font-semibold text-[#111827]">{slot.concept}</td><td className="px-4 py-3">{slot.due}</td>
                                            <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${slot.risk === 'High' ? 'bg-[#fee2e2] text-[#b91c1c]' : slot.risk === 'Medium' ? 'bg-[#fef9c3] text-[#92400e]' : 'bg-[#dcfce7] text-[#166534]'}`}>{slot.risk}</span></td>
                                            <td className="px-4 py-3 text-sm text-[#475569]">{slot.notes}</td>
                                            <td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button onClick={() => handleComplete(slot._id)} className="rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#166534] transition hover:bg-[#bbf7d0]">Complete</button><button onClick={() => handleSkip(slot._id)} className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold text-[#64748b] transition hover:bg-[#e2e8f0]">Skip</button></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
};

export default StudentRevisions;
