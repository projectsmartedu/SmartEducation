import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { progressAPI, gamificationAPI } from '../services/api';

const StudentProgress = () => {
    const [stats, setStats] = useState(null);
    const [gamification, setGamification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, gamRes] = await Promise.all([
                    progressAPI.getStats(),
                    gamificationAPI.getMyProfile()
                ]);
                setStats(statsRes.data || null);
                setGamification(gamRes.data?.profile || null);
            } catch {
                setError('Failed to load progress data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const progressMetrics = stats
        ? [
            { label: 'Average mastery', value: Math.round((stats.averageMastery ?? 0) * 100) },
            { label: 'Topics completed', value: stats.completed ?? 0, max: stats.totalTopics ?? 1, isCount: true },
            { label: 'Topics mastered', value: stats.mastered ?? 0, max: stats.totalTopics ?? 1, isCount: true },
            { label: 'Total study time', value: `${stats.totalTimeSpentMinutes ?? 0} min`, isText: true }
        ]
        : [];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                    <h1 className="text-2xl font-semibold text-[#0f172a]">Progress Insights</h1>
                    <p className="mt-2 text-sm text-[#475569]">
                        Analytics drawn from your live study telemetry across all enrolled courses.
                    </p>
                </section>

                {error && (
                    <div className="rounded-2xl bg-[#fee2e2] p-4 text-sm text-[#b91c1c]">{error}</div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e2e8f0] border-t-[#4338ca]" />
                    </div>
                ) : (
                    <>
                        <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                            <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Core Metrics</h2>
                            <div className="space-y-4">
                                {progressMetrics.map((metric) => (
                                    <div key={metric.label} className="rounded-3xl bg-[#f8fafc] p-5 shadow transition hover:-translate-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-[#111827]">{metric.label}</span>
                                            <span className="text-sm font-semibold text-[#4338ca]">
                                                {metric.isText
                                                    ? metric.value
                                                    : metric.isCount
                                                        ? `${metric.value} / ${metric.max}`
                                                        : `${metric.value}%`
                                                }
                                            </span>
                                        </div>
                                        {!metric.isText && (
                                            <div className="mt-3 h-2 rounded-full bg-[#e2e8f0]">
                                                <div
                                                    className="h-2 rounded-full bg-gradient-to-r from-[#4338ca] to-[#2563eb]"
                                                    style={{ width: `${metric.isCount ? Math.round((metric.value / metric.max) * 100) : metric.value}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {gamification && (
                            <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                                <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Gamification</h2>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="rounded-3xl bg-[#f8fafc] p-5 text-center">
                                        <p className="text-xs uppercase tracking-widest text-[#64748b]">Total XP</p>
                                        <p className="mt-2 text-2xl font-semibold text-[#111827]">{gamification.totalPoints?.toLocaleString()}</p>
                                    </div>
                                    <div className="rounded-3xl bg-[#f8fafc] p-5 text-center">
                                        <p className="text-xs uppercase tracking-widest text-[#64748b]">Level</p>
                                        <p className="mt-2 text-2xl font-semibold text-[#4338ca]">{gamification.level}</p>
                                    </div>
                                    <div className="rounded-3xl bg-[#f8fafc] p-5 text-center">
                                        <p className="text-xs uppercase tracking-widest text-[#64748b]">Current Streak</p>
                                        <p className="mt-2 text-2xl font-semibold text-[#ef4444]">{gamification.currentStreak} days</p>
                                    </div>
                                </div>
                                {gamification.badges?.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-semibold text-[#0f172a] mb-3">Badges Earned</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {gamification.badges.map((badge) => (
                                                <div key={badge.badgeId} className="rounded-full bg-[#ede9fe] px-4 py-2 text-xs font-semibold text-[#4338ca]">
                                                    {badge.icon} {badge.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {stats?.courseBreakdown?.length > 0 && (
                            <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                                <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Course Breakdown</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {stats.courseBreakdown.map((cb) => (
                                        <div key={cb.course} className="rounded-3xl bg-[#f8fafc] p-5 shadow transition hover:-translate-y-1">
                                            <h3 className="text-sm font-semibold text-[#111827]">{cb.courseName || cb.course}</h3>
                                            <p className="mt-1 text-xs text-[#475569]">
                                                Mastery: {Math.round((cb.averageMastery ?? 0) * 100)}%
                                                &nbsp;•&nbsp; {cb.completed ?? 0} / {cb.total ?? 0} completed
                                            </p>
                                            <div className="mt-3 h-2 rounded-full bg-[#e2e8f0]">
                                                <div
                                                    className="h-2 rounded-full bg-gradient-to-r from-[#4338ca] to-[#0ea5e9]"
                                                    style={{ width: `${Math.round((cb.averageMastery ?? 0) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentProgress;
