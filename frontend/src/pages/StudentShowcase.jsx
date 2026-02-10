import React from 'react';

const revisionRows = [
    {
        concept: 'Differential Equations',
        priority: 'High risk',
        due: 'Today',
        status: 'Pending'
    },
    {
        concept: 'Electrostatics',
        priority: 'Medium',
        due: 'Tomorrow',
        status: 'Scheduled'
    },
    {
        concept: 'Series & Sequences',
        priority: 'Refresh',
        due: 'Thu',
        status: 'Completed'
    }
];

const gamificationStats = [
    { label: 'XP Earned', value: '8,420', accent: 'bg-[#4338ca]' },
    { label: 'Mastery Streak', value: '14 days', accent: 'bg-[#14b8a6]' },
    { label: 'Weekly Progress', value: '86%', accent: 'bg-[#f97316]' }
];

const StudentShowcase = () => {
    return (
        <div className="min-h-screen bg-[#f7f3ef] py-20">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[260px,1fr]">
                <aside className="h-full rounded-[26px] bg-white p-6 shadow-xl">
                    <h2 className="text-lg font-semibold text-[#111827]">Student Dashboard</h2>
                    <nav className="mt-6 space-y-2 text-sm font-semibold text-[#475569]">
                        {['Overview', 'Knowledge Map', 'Adaptive Revisions', 'Progress', 'Doubts'].map((item) => (
                            <button
                                key={item}
                                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 transition hover:text-[#111827] ${item === 'Knowledge Map' ? 'bg-[#e0e7ff] text-[#312e81]' : 'bg-[#f8fafc]'
                                    }`}
                            >
                                {item}
                                <span className="text-xs uppercase tracking-widest">›</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="grid gap-6">
                    <section className="rounded-[28px] bg-white p-6 shadow-xl">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-[#0f172a]">Hey Aria, here is your live knowledge map.</h1>
                                <p className="text-sm text-[#475569]">
                                    Nodes glow by mastery. Hover to see prerequisites and recommended revision actions.
                                </p>
                            </div>
                            <button className="rounded-full bg-[#4338ca] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#312e81]">
                                Export Map
                            </button>
                        </div>
                        <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr,1fr]">
                            <div className="rounded-3xl bg-[#eef2ff] p-6">
                                <div className="flex h-64 items-center justify-center rounded-2xl bg-white/70 shadow-inner">
                                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#4338ca]">
                                        Interactive knowledge graph preview
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-4">
                                <div className="rounded-3xl bg-[#fef9c3] p-5 shadow">
                                    <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#92400e]">Prerequisite gap</h3>
                                    <p className="mt-2 text-sm text-[#854d0e]">
                                        Vectors requires a refresh before attempting 3D Geometry.
                                    </p>
                                </div>
                                <div className="rounded-3xl bg-[#cffafe] p-5 shadow">
                                    <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0f766e]">Mastery level</h3>
                                    <p className="mt-2 text-sm text-[#0f766e]">
                                        Mechanics mastery 78% — keep revision streak to unlock Mastery Badge.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                        <div className="rounded-[28px] bg-white p-6 shadow-xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-[#0f172a]">Adaptive Revision Table</h2>
                                <span className="rounded-full bg-[#db2777]/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#db2777]">
                                    AI predicted
                                </span>
                            </div>
                            <table className="mt-6 w-full text-sm text-[#334155]">
                                <thead>
                                    <tr className="text-left">
                                        <th className="pb-3">Concept</th>
                                        <th className="pb-3">Priority</th>
                                        <th className="pb-3">Next revision</th>
                                        <th className="pb-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e2e8f0]">
                                    {revisionRows.map((row) => (
                                        <tr key={row.concept} className="transition hover:bg-[#f8fafc]">
                                            <td className="py-3 font-semibold text-[#111827]">{row.concept}</td>
                                            <td className="py-3">
                                                <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold text-[#4338ca]">
                                                    {row.priority}
                                                </span>
                                            </td>
                                            <td className="py-3">{row.due}</td>
                                            <td className="py-3 text-right font-medium text-[#4338ca]">{row.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-6">
                            <div className="rounded-[28px] bg-white p-6 shadow-xl">
                                <h2 className="text-lg font-semibold text-[#0f172a]">Weakness Heatmap</h2>
                                <div className="mt-4 grid grid-cols-5 gap-2">
                                    {[40, 62, 73, 28, 90, 55, 38, 68, 84, 47].map((score, index) => (
                                        <div
                                            key={index}
                                            className="flex h-16 items-center justify-center rounded-2xl text-sm font-semibold text-white"
                                            style={{ background: `rgba(67, 56, 202, ${Math.max(0.3, score / 100)})` }}
                                        >
                                            {score}%
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-[28px] bg-white p-6 shadow-xl">
                                <h2 className="text-lg font-semibold text-[#0f172a]">Gamified Progression</h2>
                                <div className="mt-4 grid gap-3">
                                    {gamificationStats.map((stat) => (
                                        <div key={stat.label} className="flex items-center justify-between rounded-2xl bg-[#f8fafc] p-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-widest text-[#475569]">{stat.label}</p>
                                                <p className="text-lg font-semibold text-[#111827]">{stat.value}</p>
                                            </div>
                                            <span className={`h-10 w-10 rounded-2xl ${stat.accent}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default StudentShowcase;
