import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { coursesAPI, progressAPI, quizAPI } from '../services/api';

const StudentTopicQuiz = () => {
    const { courseId, topicId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [courseTitle, setCourseTitle] = useState('Course');
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizError, setQuizError] = useState('');
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState(null);

    const generateQuiz = useCallback(async (currentTopicId = topicId) => {
        setQuizLoading(true);
        setQuizError('');
        setQuizQuestions([]);
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizScore(null);

        try {
            const res = await quizAPI.generateTopicQuiz(currentTopicId, { questionCount: 10, difficulty: 'moderate' });
            const questions = res.data?.questions || [];
            if (!Array.isArray(questions) || questions.length === 0) {
                throw new Error('Quiz not available');
            }
            setQuizQuestions(questions);
        } catch (err) {
            setQuizError(err?.response?.data?.message || 'Failed to generate quiz. Please try again.');
        } finally {
            setQuizLoading(false);
        }
    }, [topicId]);

    const loadTopic = useCallback(async () => {
        if (!navigator.onLine) {
            setQuizError('Quiz requires an internet connection. Please try again when you are online.');
            setLoading(false);
            return;
        }

        try {
            const courseRes = await coursesAPI.getById(courseId);
            const topics = courseRes.data?.topics || [];
            const currentTopicFromState = location.state?.topic;
            const currentTopic = currentTopicFromState || topics.find(t => String(t?._id || t?.id) === String(topicId));
            setCourseTitle(courseRes.data?.course?.title || 'Course');

            if (!currentTopic) {
                setQuizError('Topic not found.');
                setLoading(false);
                return;
            }

            setTopic(currentTopic);
            await generateQuiz(currentTopic._id);
        } catch {
            setQuizError('Failed to load topic quiz. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [courseId, topicId, generateQuiz, location.state]);

    useEffect(() => {
        loadTopic();
    }, [loadTopic]);

    const handleQuizAnswer = (questionId, answerIndex) => {
        if (quizSubmitted) return;
        setQuizAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
    };

    const allQuestionsAnswered = quizQuestions.length > 0 && Object.keys(quizAnswers).length === quizQuestions.length;

    const handleSubmitQuiz = async () => {
        if (quizSubmitted || !topic) return;

        const required = quizQuestions.length;
        const answered = Object.keys(quizAnswers).length;

        if (required === 0) {
            setQuizError('No quiz questions available. Please try again.');
            return;
        }
        if (answered < required) {
            setQuizError('Please answer all questions before submitting.');
            return;
        }

        let correct = 0;
        quizQuestions.forEach(q => {
            if (quizAnswers[q.id] === q.answerIndex) {
                correct += 1;
            }
        });

        const scorePercent = Math.round((correct / required) * 100);
        setQuizSubmitted(true);
        setQuizScore(scorePercent);
        setQuizError('');

        try {
            setSubmitting(true);

            if (scorePercent < 50) {
                await progressAPI.updateProgress(topic._id, {
                    status: 'in-progress',
                    lastScore: scorePercent,
                    timeSpentMinutes: 0
                });
                setQuizError('Score is below 50%. Reattempt required.');
                return;
            }

            await progressAPI.updateProgress(topic._id, {
                status: 'completed',
                masteryLevel: 0.8,
                timeSpentMinutes: topic.estimatedMinutes || 15,
                lastScore: scorePercent
            });
        } catch {
            setQuizError('Failed to submit quiz result. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-10 w-10 animate-spin text-[#4338ca]" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <Link to={`/student/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm font-medium text-[#4338ca] hover:text-[#312e81] mb-2">
                                <ArrowLeft className="h-4 w-4" /> Back to Course
                            </Link>
                            <h1 className="text-xl font-semibold text-[#0f172a]">{topic?.title || 'Topic'} Quiz</h1>
                            <p className="text-sm text-[#64748b]">{courseTitle} • Pass mark: 50%</p>
                        </div>
                        <button
                            onClick={() => navigate(`/student/courses/${courseId}`)}
                            className="rounded-full border border-[#e2e8f0] px-4 py-1.5 text-xs font-medium text-[#475569] hover:bg-[#f1f5f9]"
                        >
                            Exit Quiz
                        </button>
                    </div>
                </section>

                <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                    {quizLoading ? (
                        <div className="flex items-center gap-3 py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-[#4338ca]" />
                            <span className="text-sm text-[#475569]">Generating quiz...</span>
                        </div>
                    ) : quizError ? (
                        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{quizError}</div>
                    ) : (
                        <div className="space-y-6">
                            {quizQuestions.map((q, index) => (
                                <div key={q.id} className="rounded-2xl border border-[#e2e8f0] p-4">
                                    <p className="text-sm font-semibold text-[#0f172a]">{index + 1}. {q.question}</p>
                                    <div className="mt-3 grid gap-2">
                                        {q.options.map((opt, optIndex) => {
                                            const isSelected = quizAnswers[q.id] === optIndex;
                                            const isCorrect = quizSubmitted && q.answerIndex === optIndex;
                                            const isIncorrect = quizSubmitted && isSelected && q.answerIndex !== optIndex;

                                            return (
                                                <label
                                                    key={`${q.id}_${optIndex}`}
                                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${isCorrect
                                                        ? 'border-[#16a34a] bg-[#dcfce7]'
                                                        : isIncorrect
                                                            ? 'border-[#ef4444] bg-[#fee2e2]'
                                                            : isSelected
                                                                ? 'border-[#4338ca] bg-[#ede9fe]'
                                                                : 'border-[#e2e8f0] hover:bg-[#f8fafc]'
                                                        } ${quizSubmitted ? 'cursor-default' : ''}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`quiz_${q.id}`}
                                                        className="h-4 w-4"
                                                        checked={isSelected}
                                                        disabled={quizSubmitted}
                                                        onChange={() => handleQuizAnswer(q.id, optIndex)}
                                                    />
                                                    <span>{opt}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {quizSubmitted && q.explanation && (
                                        <p className="mt-3 text-xs text-[#475569]">Explanation: {q.explanation}</p>
                                    )}
                                </div>
                            ))}

                            {quizSubmitted && quizScore !== null && (
                                <div className="rounded-xl bg-[#f1f5f9] p-4 text-sm text-[#0f172a]">
                                    Score: <span className="font-semibold">{quizScore}%</span>
                                </div>
                            )}

                            {quizSubmitted && quizScore !== null && quizScore < 50 && (
                                <button
                                    onClick={() => generateQuiz(topic._id)}
                                    disabled={quizLoading}
                                    className="rounded-full bg-[#4338ca] px-6 py-2 text-sm font-semibold text-white hover:bg-[#312e81] disabled:opacity-50"
                                >
                                    {quizLoading ? 'Loading Quiz...' : 'Reattempt Quiz'}
                                </button>
                            )}

                            {!quizSubmitted && (
                                <div className="flex flex-col items-start gap-2">
                                    <button
                                        onClick={handleSubmitQuiz}
                                        disabled={submitting || !allQuestionsAnswered}
                                        className="rounded-full bg-[#16a34a] px-6 py-2 text-sm font-semibold text-white hover:bg-[#15803d] disabled:opacity-50"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                                    </button>
                                    {!allQuestionsAnswered && (
                                        <p className="text-xs text-[#64748b]">Answer all questions to enable submit.</p>
                                    )}
                                </div>
                            )}

                            {quizSubmitted && quizScore !== null && quizScore >= 50 && (
                                <button
                                    onClick={() => navigate(`/student/courses/${courseId}`)}
                                    className="rounded-full bg-[#16a34a] px-6 py-2 text-sm font-semibold text-white hover:bg-[#15803d]"
                                >
                                    Back to Course
                                </button>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
};

export default StudentTopicQuiz;