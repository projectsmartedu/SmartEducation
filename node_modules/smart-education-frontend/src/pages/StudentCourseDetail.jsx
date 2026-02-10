import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { coursesAPI, progressAPI } from '../services/api';
import { ArrowLeft, BookOpen, Clock, CheckCircle, Circle, Loader2, FileText, Award, ChevronRight, X, File } from 'lucide-react';

const STATUS_STYLES = {
    'mastered': { bg: 'bg-[#dcfce7]', text: 'text-[#166534]', label: 'Mastered' },
    'completed': { bg: 'bg-[#dbeafe]', text: 'text-[#1d4ed8]', label: 'Completed' },
    'in-progress': { bg: 'bg-[#fef9c3]', text: 'text-[#92400e]', label: 'In Progress' },
    'not-started': { bg: 'bg-[#f1f5f9]', text: 'text-[#64748b]', label: 'Not Started' }
};

const StudentCourseDetail = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [topics, setTopics] = useState([]);
    const [progressMap, setProgressMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(null);

    // Reading view state
    const [readingTopic, setReadingTopic] = useState(null);
    const [topicContent, setTopicContent] = useState(null);
    const [contentLoading, setContentLoading] = useState(false);
    const [completionSuccess, setCompletionSuccess] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [courseRes, progressRes] = await Promise.all([
                coursesAPI.getById(courseId),
                progressAPI.getCourseProgress(courseId).catch(() => ({ data: { progress: [] } }))
            ]);
            setCourse(courseRes.data?.course || null);
            setTopics(courseRes.data?.topics || []);

            const pMap = {};
            const progressArr = progressRes.data?.progress || [];
            if (Array.isArray(progressArr)) {
                progressArr.forEach(p => {
                    const topicId = p.topic?._id || p.topic;
                    if (topicId) pMap[topicId] = p;
                });
            }
            setProgressMap(pMap);
        } catch {
            setError('Failed to load course details.');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openTopicReader = async (topic) => {
        setReadingTopic(topic);
        setContentLoading(true);
        setTopicContent(null);
        try {
            const res = await coursesAPI.getTopicContent(courseId, topic._id);
            setTopicContent(res.data);
        } catch {
            setTopicContent({ error: 'Failed to load content' });
        } finally {
            setContentLoading(false);
        }
    };

    const closeReader = () => {
        setReadingTopic(null);
        setTopicContent(null);
    };

    const handleStartTopic = async (topicId) => {
        setUpdating(topicId);
        try {
            await progressAPI.updateProgress(topicId, { status: 'in-progress', timeSpentMinutes: 0 });
            await fetchData();
        } catch {
            setError('Failed to start topic.');
        } finally {
            setUpdating(null);
        }
    };

    const handleCompleteTopic = async (topic) => {
        setUpdating(topic._id);
        try {
            await progressAPI.updateProgress(topic._id, {
                status: 'completed',
                masteryLevel: 0.8,
                timeSpentMinutes: topic.estimatedMinutes || 15
            });
            setCompletionSuccess(topic);
            await fetchData();
            setTimeout(() => setCompletionSuccess(null), 3000);
        } catch {
            setError('Failed to complete topic.');
        } finally {
            setUpdating(null);
        }
    };

    const getProgress = (topicId) => progressMap[topicId] || null;

    const sortedTopics = [...topics].sort((a, b) => a.order - b.order);

    // Check if the previous topic is completed (for sequential unlock)
    const isTopicUnlocked = (index) => {
        if (index === 0) return true;
        const prevTopic = sortedTopics[index - 1];
        const prevProg = getProgress(prevTopic._id);
        return prevProg?.status === 'completed' || prevProg?.status === 'mastered';
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

    const completedCount = topics.filter(t => {
        const p = getProgress(t._id);
        return p?.status === 'completed' || p?.status === 'mastered';
    }).length;
    const progressPercent = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

    // Reading view (full screen overlay)
    if (readingTopic) {
        const prog = getProgress(readingTopic._id);
        const isCompleted = prog?.status === 'completed' || prog?.status === 'mastered';
        const isStarted = prog?.status === 'in-progress';

        return (
            <DashboardLayout>
                <div className="space-y-4">
                    {/* Reader Header */}
                    <div className="rounded-[28px] bg-white p-5 shadow-xl ring-1 ring-[#e2e8f0]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button onClick={closeReader} className="rounded-full p-2 hover:bg-[#f1f5f9] transition">
                                    <ArrowLeft className="h-5 w-5 text-[#475569]" />
                                </button>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-[#4338ca]">Topic #{readingTopic.order}</span>
                                        <h1 className="text-lg font-semibold text-[#0f172a]">{readingTopic.title}</h1>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-[#94a3b8]">
                                        {topicContent?.wordCount && <span>{topicContent.wordCount} words</span>}
                                        {topicContent?.readingTime && <span>~{topicContent.readingTime} min read</span>}
                                        <span>{readingTopic.pointsReward} XP</span>
                                    </div>
                                </div>
                            </div>
                            {isCompleted ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-4 py-2 text-sm font-semibold text-[#166534]">
                                    <CheckCircle className="h-4 w-4" /> Completed
                                </span>
                            ) : (
                                <button
                                    onClick={() => handleCompleteTopic(readingTopic)}
                                    disabled={updating === readingTopic._id}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#16a34a] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#15803d] disabled:opacity-50 transition">
                                    {updating === readingTopic._id ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Completing...</>
                                    ) : (
                                        <><CheckCircle className="h-4 w-4" /> Mark as Complete (+{readingTopic.pointsReward} XP)</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="rounded-[28px] bg-white shadow-xl ring-1 ring-[#e2e8f0] overflow-hidden">
                        {contentLoading ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <Loader2 className="h-10 w-10 animate-spin text-[#4338ca]" />
                                <p className="mt-4 text-sm text-[#64748b]">Loading topic content...</p>
                            </div>
                        ) : topicContent?.error ? (
                            <div className="p-12 text-center">
                                <p className="text-sm text-red-600">{topicContent.error}</p>
                            </div>
                        ) : !topicContent?.material?.content ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <FileText className="h-16 w-16 text-[#cbd5e1]" />
                                <h3 className="mt-4 text-lg font-semibold text-[#475569]">No Content Available</h3>
                                <p className="mt-2 text-sm text-[#94a3b8]">The teacher hasn't uploaded material for this topic yet.</p>
                                {!isCompleted && (
                                    <button onClick={() => handleCompleteTopic(readingTopic)}
                                        disabled={updating === readingTopic._id}
                                        className="mt-6 rounded-full bg-[#16a34a] px-6 py-2 text-sm font-semibold text-white hover:bg-[#15803d] disabled:opacity-50">
                                        {updating === readingTopic._id ? 'Completing...' : `Mark Complete Anyway (+${readingTopic.pointsReward} XP)`}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="p-8">
                                {/* Material header */}
                                {topicContent.material.type === 'pdf' && topicContent.material.originalFilename && (
                                    <div className="mb-6 flex items-center gap-3 rounded-2xl bg-[#f1f5f9] p-4">
                                        <File className="h-8 w-8 text-[#4338ca]" />
                                        <div>
                                            <p className="text-sm font-medium text-[#0f172a]">{topicContent.material.originalFilename}</p>
                                            <p className="text-xs text-[#64748b]">
                                                {topicContent.material.fileSize && `${(topicContent.material.fileSize / 1024).toFixed(0)} KB • `}
                                                {topicContent.wordCount} words • ~{topicContent.readingTime} min read
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Main content */}
                                <div className="prose prose-sm max-w-none">
                                    <div className="whitespace-pre-wrap text-[#1e293b] leading-relaxed text-[15px] font-[system-ui]">
                                        {topicContent.material.content}
                                    </div>
                                </div>

                                {/* Bottom completion button */}
                                {!isCompleted && (
                                    <div className="mt-10 flex justify-center border-t border-[#e2e8f0] pt-8">
                                        <button onClick={() => handleCompleteTopic(readingTopic)}
                                            disabled={updating === readingTopic._id}
                                            className="inline-flex items-center gap-2 rounded-full bg-[#16a34a] px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-[#15803d] disabled:opacity-50 transition transform hover:scale-105">
                                            {updating === readingTopic._id ? (
                                                <><Loader2 className="h-5 w-5 animate-spin" /> Completing...</>
                                            ) : (
                                                <><Award className="h-5 w-5" /> I've finished reading — Complete Topic (+{readingTopic.pointsReward} XP)</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Course overview (topic list)
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Completion success toast */}
                {completionSuccess && (
                    <div className="fixed top-4 right-4 z-50 animate-bounce rounded-2xl bg-[#16a34a] px-6 py-4 text-white shadow-2xl">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🎉</span>
                            <div>
                                <p className="font-semibold">Topic Completed!</p>
                                <p className="text-sm opacity-90">+{completionSuccess.pointsReward} XP earned for "{completionSuccess.title}"</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Course Header */}
                <section className="rounded-[28px] bg-gradient-to-br from-[#ede9fe] via-[#f0f9ff] to-[#fef9c3] p-6 shadow-xl">
                    <Link to="/student/courses" className="inline-flex items-center gap-1 text-sm font-medium text-[#4338ca] hover:text-[#312e81] mb-4">
                        <ArrowLeft className="h-4 w-4" /> Back to My Courses
                    </Link>
                    <h1 className="text-2xl font-semibold text-[#0f172a]">{course?.title || 'Course'}</h1>
                    <p className="mt-1 text-sm text-[#475569]">{course?.description}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#475569]">
                        <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {course?.subject}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course?.estimatedHours}h estimated</span>
                        <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> {completedCount}/{topics.length} completed</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-[#475569] mb-1">
                            <span>Progress</span>
                            <span className="font-semibold">{progressPercent}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-white/60">
                            <div className="h-3 rounded-full bg-gradient-to-r from-[#4338ca] to-[#0ea5e9] transition-all"
                                style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                </section>

                {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

                {/* Topics list - sequential learning path */}
                <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                    <h2 className="text-lg font-semibold text-[#0f172a] mb-2">Course Topics</h2>
                    <p className="text-sm text-[#64748b] mb-6">Complete topics in order. Each topic earns you XP points.</p>

                    {topics.length === 0 ? (
                        <p className="py-8 text-center text-sm text-[#94a3b8]">No topics in this course yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {sortedTopics.map((topic, index) => {
                                const prog = getProgress(topic._id);
                                const status = prog?.status || 'not-started';
                                const style = STATUS_STYLES[status] || STATUS_STYLES['not-started'];
                                const isCompleted = status === 'completed' || status === 'mastered';
                                const unlocked = isTopicUnlocked(index);
                                const isUpdating = updating === topic._id;
                                const hasMaterial = !!topic.material;

                                return (
                                    <div key={topic._id}
                                        className={`rounded-2xl border p-5 transition ${unlocked
                                            ? 'border-[#e2e8f0] bg-[#f8fafc] hover:shadow-md cursor-pointer'
                                            : 'border-[#e2e8f0] bg-[#f1f5f9] opacity-60 cursor-not-allowed'
                                            }`}
                                        onClick={() => unlocked && openTopicReader(topic)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {/* Status icon */}
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isCompleted
                                                    ? 'bg-[#dcfce7]'
                                                    : status === 'in-progress'
                                                        ? 'bg-[#fef9c3]'
                                                        : unlocked
                                                            ? 'bg-[#ede9fe]'
                                                            : 'bg-[#e2e8f0]'
                                                    }`}>
                                                    {isCompleted ? (
                                                        <CheckCircle className="h-5 w-5 text-[#16a34a]" />
                                                    ) : status === 'in-progress' ? (
                                                        <span className="text-lg">📖</span>
                                                    ) : unlocked ? (
                                                        <span className="text-sm font-bold text-[#4338ca]">{index + 1}</span>
                                                    ) : (
                                                        <span className="text-lg">🔒</span>
                                                    )}
                                                </div>

                                                {/* Topic info */}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-semibold text-[#0f172a]">{topic.title}</h3>
                                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                                                            {style.label}
                                                        </span>
                                                    </div>
                                                    {topic.description && <p className="mt-0.5 text-xs text-[#64748b] line-clamp-1">{topic.description}</p>}
                                                    <div className="mt-1 flex gap-3 text-xs text-[#94a3b8]">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> {topic.estimatedMinutes} min
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Award className="h-3 w-3" /> {topic.pointsReward} XP
                                                        </span>
                                                        {hasMaterial && (
                                                            <span className="flex items-center gap-1 text-[#4338ca]">
                                                                <FileText className="h-3 w-3" /> {topic.material?.type === 'pdf' ? 'PDF' : 'Text'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right side - action */}
                                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                {isUpdating ? (
                                                    <Loader2 className="h-5 w-5 animate-spin text-[#4338ca]" />
                                                ) : isCompleted ? (
                                                    <span className="text-2xl">✅</span>
                                                ) : unlocked && status === 'not-started' ? (
                                                    <button onClick={() => { handleStartTopic(topic._id); openTopicReader(topic); }}
                                                        className="rounded-full bg-[#4338ca] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#312e81] transition">
                                                        Start Learning
                                                    </button>
                                                ) : unlocked && status === 'in-progress' ? (
                                                    <button onClick={() => openTopicReader(topic)}
                                                        className="inline-flex items-center gap-1 rounded-full bg-[#f59e0b] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#d97706] transition">
                                                        Continue <ChevronRight className="h-3.5 w-3.5" />
                                                    </button>
                                                ) : !unlocked ? (
                                                    <span className="text-xs text-[#94a3b8]">Complete previous topic</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Course completion message */}
                    {completedCount === topics.length && topics.length > 0 && (
                        <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#dcfce7] via-[#fef9c3] to-[#ede9fe] p-6 text-center">
                            <span className="text-4xl">🎓</span>
                            <h3 className="mt-2 text-xl font-bold text-[#0f172a]">Course Completed!</h3>
                            <p className="mt-1 text-sm text-[#475569]">
                                Congratulations! You've completed all {topics.length} topics in {course?.title}.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
};

export default StudentCourseDetail;
