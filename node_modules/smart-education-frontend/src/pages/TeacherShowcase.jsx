import React from 'react';

const cohortStats = [
    { label: 'Average mastery', value: '82%', trend: '+6% this week', tone: 'text-[#2563eb]' },
    { label: 'At-risk learners', value: '12', trend: 'Need intervention', tone: 'text-[#dc2626]' },
    { label: 'Resolved doubts', value: '246', trend: '+58% vs last month', tone: 'text-[#16a34a]' }
];

const TeacherShowcase = () => {
    return (
        <div className="min-h-screen bg-[#f1f5f9] py-20">
            <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[260px,1fr]">
                <aside className="rounded-[26px] bg-white p-6 shadow-xl">
                    <h2 className="text-lg font-semibold text-[#111827]">Teacher Command Hub</h2>
                    <nav className="mt-6 space-y-2 text-sm font-semibold text-[#475569]">
                        {['Class Overview', 'Knowledge Heatmap', 'Student Comparisons', 'Concept Analytics', 'Interventions'].map((item, index) => (
                            <button
                                key={item}
                                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 transition hover:text-[#0f172a] ${index === 1 ? 'bg-[#dbeafe] text-[#1e40af]' : 'bg-[#f8fafc]'
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
                                <h1 className="text-2xl font-semibold text-[#0f172a]">Grade 11 Physics — Concept Mastery Overview</h1>
                                <p className="text-sm text-[#475569]">
                                    Heatmaps help you spot struggling concepts by cohort and drill down to individual learners instantly.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button className="rounded-full border border-[#94a3b8] px-5 py-2 text-sm font-semibold text-[#475569] transition hover:border-[#64748b] hover:text-[#0f172a]">
                                    Export report
                                </button>
                                <button className="rounded-full bg-[#1d4ed8] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#1e3a8a]">
                                    Schedule sync
                                </button>
                            </div>
                        </div>
                        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr,1fr]">
                            <div className="rounded-3xl bg-[#e0f2fe] p-6">
                                <div className="flex h-72 items-center justify-center rounded-2xl bg-white shadow-inner">
                                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#0369a1]">
                                        Class knowledge heatmap visual
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-4">
                                {cohortStats.map((stat) => (
                                    <div key={stat.label} className="rounded-3xl bg-white p-5 shadow">
                                        <p className="text-xs uppercase tracking-[0.28em] text-[#64748b]">{stat.label}</p>
                                        <p className="mt-2 text-2xl font-semibold text-[#0f172a]">{stat.value}</p>
                                        <p className={`text-sm font-semibold ${stat.tone}`}>{stat.trend}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                        <div className="rounded-[28px] bg-white p-6 shadow-xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-[#0f172a]">Student Comparison</h2>
                                <span className="rounded-full bg-[#f5d0fe] px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#86198f]">
                                    Insight view
                                </span>
                            </div>
                            <div className="mt-6 grid gap-3">
                                {[
                                    { name: 'Aditya', mastery: 89, trend: '+8% vs last sprint' },
                                    { name: 'Sara', mastery: 74, trend: '+2% vs last sprint' },
                                    { name: 'Ishaan', mastery: 62, trend: '-5% vs last sprint' },
                                    { name: 'Ria', mastery: 96, trend: '+11% vs last sprint' }
                                ].map((student) => (
                                    <div key={student.name} className="rounded-2xl bg-[#f8fafc] p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d4ed8]/10 text-sm font-semibold text-[#1d4ed8]">
                                                    {student.name.charAt(0)}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-semibold text-[#0f172a]">{student.name}</p>
                                                    <p className="text-xs text-[#64748b]">{student.trend}</p>
                                                </div>
                                            </div>
                                            <span className="text-lg font-semibold text-[#4338ca]">{student.mastery}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[28px] bg-white p-6 shadow-xl">
                            <h2 className="text-lg font-semibold text-[#0f172a]">Concept-wise weakness analysis</h2>
                            <div className="mt-6 space-y-4">
                                {[
                                    { concept: 'Magnetic Flux', severity: 'Critical', action: 'Assign practice set' },
                                    { concept: 'Wave Optics', severity: 'Moderate', action: 'Plan live doubt session' },
                                    { concept: 'Rotational Dynamics', severity: 'Monitor', action: 'Review after next quiz' }
                                ].map((issue) => (
                                    <div key={issue.concept} className="rounded-2xl border border-[#cbd5f5] bg-[#eef2ff] p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-[#1e1b4b]">{issue.concept}</p>
                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#1d4ed8]">
                                                {issue.severity}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs text-[#4338ca]">{issue.action}</p>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-6 w-full rounded-full bg-[#4338ca] py-3 text-sm font-semibold text-white shadow hover:bg-[#312e81]">
                                Generate intervention plan
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default TeacherShowcase;
