import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { progressAPI, coursesAPI } from '../services/api';

const StudentKnowledgeMap = () => {
    const [knowledgeConcepts, setKnowledgeConcepts] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await coursesAPI.getMyCourses();
                const enrolled = res.data?.courses || [];
                setCourses(enrolled);
                if (enrolled.length > 0) setSelectedCourse(enrolled[0]._id);
            } catch (err) {
                setError('Failed to load courses.');
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        if (!selectedCourse) return;
        const fetchMap = async () => {
            setLoading(true);
            try {
                const res = await progressAPI.getKnowledgeMap(selectedCourse);
                const nodes = res.data?.nodes || [];
                setKnowledgeConcepts(
                    nodes.map((n) => ({
                        name: n.title,
                        mastery: Math.round((n.mastery ?? 0) * 100),
                        focus: n.forgetRisk === 'high' || n.forgetRisk === 'critical'
                            ? 'High forget risk — revision recommended.'
                            : n.forgetRisk === 'moderate'
                                ? 'Moderate risk — reinforce soon.'
                                : n.status === 'mastered'
                                    ? 'Mastered — keep it up!'
                                    : 'Continue practicing.',
                        status: n.status,
                        forgetRisk: n.forgetRisk
                    }))
                );
            } catch {
                setError('Failed to load knowledge map.');
            } finally {
                setLoading(false);
            }
        };
        fetchMap();
    }, [selectedCourse]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                    <h1 className="text-2xl font-semibold text-[#0f172a]">Knowledge Map Overview</h1>
                    <p className="mt-2 text-sm text-[#475569]">
                        This page surfaces concept mastery across your personalized graph, powered by live progress data.
                    </p>
                    {courses.length > 1 && (
                        <select
                            className="mt-4 rounded-xl border border-[#e2e8f0] px-4 py-2 text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#4338ca]"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            {courses.map((c) => (
                                <option key={c._id} value={c._id}>{c.title}</option>
                            ))}
                        </select>
                    )}
                </section>

                {error && (
                    <div className="rounded-2xl bg-[#fee2e2] p-4 text-sm text-[#b91c1c]">{error}</div>
                )}

                <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e2e8f0] border-t-[#4338ca]" />
                        </div>
                    ) : knowledgeConcepts.length === 0 ? (
                        <p className="py-8 text-center text-sm text-[#94a3b8]">No concepts found for this course yet.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {knowledgeConcepts.map((concept) => (
                                <div key={concept.name} className="rounded-3xl bg-[#f8fafc] p-5 shadow transition hover:-translate-y-1">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-[#111827]">{concept.name}</h2>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${concept.forgetRisk === 'high' || concept.forgetRisk === 'critical'
                                                ? 'bg-[#fee2e2] text-[#b91c1c]'
                                                : concept.forgetRisk === 'moderate'
                                                    ? 'bg-[#fef9c3] text-[#92400e]'
                                                    : 'bg-[#dcfce7] text-[#166534]'
                                                }`}
                                        >
                                            {concept.forgetRisk || 'low'}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-[#475569]">Mastery {concept.mastery}%</p>
                                    <div className="mt-3 h-2 rounded-full bg-[#e2e8f0]">
                                        <div
                                            className="h-2 rounded-full bg-gradient-to-r from-[#4338ca] to-[#0ea5e9]"
                                            style={{ width: `${concept.mastery}%` }}
                                        />
                                    </div>
                                    <p className="mt-3 text-xs text-[#64748b]">{concept.focus}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
};

export default StudentKnowledgeMap;
