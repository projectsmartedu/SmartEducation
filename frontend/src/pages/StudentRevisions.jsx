import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import InteractiveRevisionPlanner from '../components/InteractiveRevisionPlanner';
import { revisionsAPI } from '../services/api';
import { BarChart3 } from 'lucide-react';

const StudentRevisions = () => {
    const [revisionSchedule, setRevisionSchedule] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [predictions, setPredictions] = useState(null);
    const [mlPredictions, setMlPredictions] = useState({});

    const fetchRevisions = useCallback(async () => {
        setLoading(true);
        try {
            const [revRes, statsRes] = await Promise.all([
                revisionsAPI.getMyRevisions({ status: 'pending,overdue' }),
                revisionsAPI.getStats()
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
            setStats(statsRes.data || null);
        } catch {
            setError('Failed to load revisions.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRevisions();
    }, [fetchRevisions]);

    // Load mind map data once revision schedule is populated
    const loadMindMapData = useCallback(() => {
        // Transform revision schedule into topic progress format for InteractiveRevisionPlanner
        const topicProgress = revisionSchedule.map((slot, idx) => ({
            id: `topic-${idx}`,
            name: slot.concept,
            masteryPercentage: Math.round((0.4 + (idx % 3) * 0.2 + Math.random() * 0.2) * 100),
            daysSinceReview: 5 + (idx % 4) * 8,
            quizzesTaken: 2 + (idx % 5),
            videosWatched: 3 + (idx % 6),
            revisionCount: 1 + (idx % 3),
            lastScore: 60 + (idx % 4) * 10,
        }));

        // Generate ML predictions based on topic data
        const predictions = {};
        topicProgress.forEach((topic) => {
            const masteryFactor = (1 - topic.masteryPercentage / 100) * 0.6;
            const staleFactor = Math.min(topic.daysSinceReview / 30, 1) * 0.4;
            const urgencyScore = Math.min(masteryFactor + staleFactor, 1);

            predictions[topic.id] = {
                urgencyScore,
                riskCategory: urgencyScore > 0.66 ? 'HIGH' : urgencyScore > 0.33 ? 'MEDIUM' : 'LOW',
                recommendation: urgencyScore > 0.66
                    ? 'Start revision immediately. This topic needs urgent focus.'
                    : urgencyScore > 0.33
                        ? 'Schedule regular revision this week to maintain understanding.'
                        : 'Well-maintained topic. Continue with current learning pace.'
            };
        });

        setPredictions(topicProgress);
        setMlPredictions(predictions);
    }, [revisionSchedule]);

    useEffect(() => {
        if (revisionSchedule.length > 0) {
            loadMindMapData();
        }
    }, [revisionSchedule, loadMindMapData]);

    const handleComplete = async (id) => {
        try {
            await revisionsAPI.complete(id, { score: 80 });
            fetchRevisions();
        } catch {
            setError('Failed to complete revision.');
        }
    };

    const handleSkip = async (id) => {
        try {
            await revisionsAPI.skip(id);
            fetchRevisions();
        } catch {
            setError('Failed to skip revision.');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <section className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-[#0f172a]">Adaptive Revision Planner</h1>
                    <p className="mt-2 text-sm text-[#475569]">
                        Revision slots are generated based on your mastery and forget-risk analysis. Complete or skip revisions to keep your schedule updated.
                    </p>
                    {stats && (
                        <div className="mt-4 flex flex-wrap gap-4">
                            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2">
                                <span className="text-xs uppercase tracking-widest text-[#64748b]">Pending</span>
                                <p className="text-lg font-semibold text-[#111827]">{stats.pending ?? 0}</p>
                            </div>
                            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2">
                                <span className="text-xs uppercase tracking-widest text-[#64748b]">Completed</span>
                                <p className="text-lg font-semibold text-[#166534]">{stats.completed ?? 0}</p>
                            </div>
                            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2">
                                <span className="text-xs uppercase tracking-widest text-[#64748b]">Overdue</span>
                                <p className="text-lg font-semibold text-[#b91c1c]">{stats.overdue ?? 0}</p>
                            </div>
                            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2">
                                <span className="text-xs uppercase tracking-widest text-[#64748b]">Avg Score</span>
                                <p className="text-lg font-semibold text-[#4338ca]">{stats.averageScore ? `${Math.round(stats.averageScore)}%` : '—'}</p>
                            </div>
                        </div>
                    )}
                </section>

                {error && (
                    <div className="rounded-2xl bg-[#fee2e2] p-4 text-sm text-[#b91c1c]">{error}</div>
                )}

                <section className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e2e8f0] border-t-[#4338ca]" />
                        </div>
                    ) : revisionSchedule.length === 0 ? (
                        <p className="py-8 text-center text-sm text-[#94a3b8]">No pending revisions. Great job staying on track!</p>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-[#e2e8f0]">
                            <table className="w-full text-sm text-[#334155]">
                                <thead className="bg-[#f8fafc] text-xs uppercase tracking-[0.18em] text-[#64748b]">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Concept</th>
                                        <th className="px-4 py-3 text-left">Due</th>
                                        <th className="px-4 py-3 text-left">Risk</th>
                                        <th className="px-4 py-3 text-left">Notes</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {revisionSchedule.map((slot) => (
                                        <tr key={slot._id} className="border-t border-[#e2e8f0] bg-white transition hover:bg-[#f8fafc]">
                                            <td className="px-4 py-3 font-semibold text-[#111827]">{slot.concept}</td>
                                            <td className="px-4 py-3">{slot.due}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${slot.risk === 'High'
                                                        ? 'bg-[#fee2e2] text-[#b91c1c]'
                                                        : slot.risk === 'Medium'
                                                            ? 'bg-[#fef9c3] text-[#92400e]'
                                                            : 'bg-[#dcfce7] text-[#166534]'
                                                        }`}
                                                >
                                                    {slot.risk}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#475569]">{slot.notes}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleComplete(slot._id)}
                                                        className="rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#166534] transition hover:bg-[#bbf7d0]"
                                                    >
                                                        Complete
                                                    </button>
                                                    <button
                                                        onClick={() => handleSkip(slot._id)}
                                                        className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold text-[#64748b] transition hover:bg-[#e2e8f0]"
                                                    >
                                                        Skip
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Visual Mind Map Section */}
                <section className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-2xl font-semibold text-[#0f172a]"><BarChart3 className="h-6 w-6 text-[#4338ca]" /> Visual Revision Mind Map</h2>
                            <p className="mt-2 text-sm text-[#475569]">Interactive visualization of your revision urgency with ML-powered predictions</p>
                        </div>
                        <button
                            onClick={() => setShowMindMap(!showMindMap)}
                            className="rounded-lg bg-[#4338ca] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3730a3]"
                        >
                            {showMindMap ? 'Hide' : 'Show'} Mind Map
                        </button>
                    </div>

                    {showMindMap && predictions && predictions.length > 0 && studentData && revisionSchedule.length > 0 && (
                        <div className="mt-6">
                            <TraditionalMindMap
                                studentData={studentData}
                                topicProgress={revisionSchedule.map((slot, idx) => ({
                                    name: slot.concept,
                                    mastery: 0.5 + (idx % 3) * 0.15,
                                    last_studied: 5 + (idx % 4) * 8,
                                    attempts: 2 + (idx % 5),
                                    last_score: 60 + (idx % 4) * 10,
                                    practice_hours: 2 + (idx % 6)
                                }))}
                                mlPredictions={predictions}
                            />
                        </div>
                    )}
                    {showMindMap && (!predictions || predictions.length === 0) && (
                        <div className="mt-4 rounded-lg bg-[#fef3c7] p-4 text-sm text-[#92400e]">
                            Loading mind map data... Please wait.
                        </div>
                    )}
                </section>
=======
                {/* Interactive Revision Planner */}
                {revisionSchedule.length > 0 && predictions && (
                    <section>
                        <InteractiveRevisionPlanner
                            topicProgress={predictions}
                            mlPredictions={mlPredictions}
                        />
                    </section>
                )}
>>>>>>> Stashed changes
            </div>
        </DashboardLayout>
    );
};

export default StudentRevisions;
