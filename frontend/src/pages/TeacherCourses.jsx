import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { coursesAPI } from '../services/api';
import {
    Plus, Pencil, Trash2, BookOpen, Users, ChevronDown, ChevronUp, GripVertical, Eye, EyeOff, X,
    Upload, FileText, File
} from 'lucide-react';

// ─── Course Form Modal ─────────────────────────────────────────
const CourseFormModal = ({ course, onSave, onClose }) => {
    const [form, setForm] = useState({
        title: course?.title || '',
        description: course?.description || '',
        subject: course?.subject || '',
        difficulty: course?.difficulty || 'intermediate',
        estimatedHours: course?.estimatedHours || 10,
        isPublished: course?.isPublished ?? true
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.subject.trim()) {
            setError('Title and subject are required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            if (course?._id) {
                await coursesAPI.update(course._id, form);
            } else {
                await coursesAPI.create(form);
            }
            onSave();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save course.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-[#0f172a]">{course?._id ? 'Edit Course' : 'New Course'}</h2>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
                </div>
                {error && <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4338ca]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                        <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4338ca]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4338ca]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                            <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4338ca]">
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Est. Hours</label>
                            <input type="number" min={1} value={form.estimatedHours} onChange={e => setForm({ ...form, estimatedHours: Number(e.target.value) })}
                                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4338ca]" />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })}
                            className="rounded border-gray-300 text-[#4338ca] focus:ring-[#4338ca]" />
                        Published (visible to students)
                    </label>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-full px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
                        <button type="submit" disabled={saving}
                            className="rounded-full bg-[#4338ca] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#312e81] disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Topic Form Modal ──────────────────────────────────────────
const TopicFormModal = ({ courseId, topic, onSave, onClose }) => {
    const [form, setForm] = useState({
        title: topic?.title || '',
        description: topic?.description || '',
        order: topic?.order ?? 0,
        estimatedMinutes: topic?.estimatedMinutes || 30,
        pointsReward: topic?.pointsReward || 100,
        contentType: topic?.contentType || 'lesson',
        difficultyWeight: topic?.difficultyWeight || 5,
        isPublished: topic?.isPublished ?? true
    });
    const [uploadType, setUploadType] = useState('text');
    const [textContent, setTextContent] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { setError('Title is required.'); return; }
        setSaving(true);
        setError('');
        try {
            const payload = { ...form };

            if (uploadType === 'pdf' && pdfFile) {
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(pdfFile);
                });
                payload.pdfBase64 = base64;
                payload.filename = pdfFile.name;
            } else if (uploadType === 'text' && textContent.trim()) {
                payload.textContent = textContent;
            }

            if (topic?._id) {
                await coursesAPI.updateTopic(courseId, topic._id, payload);
            } else {
                await coursesAPI.createTopic(courseId, payload);
            }
            onSave();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save topic.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-[#0f172a]">{topic?._id ? 'Edit Topic' : 'Add Topic'}</h2>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
                </div>
                {error && <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4338ca]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4338ca]" />
                    </div>

                    {/* Material Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Topic Material (PDF or Text)</label>
                        <div className="flex gap-3 mb-3">
                            <button type="button" onClick={() => setUploadType('text')}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all ${uploadType === 'text' ? 'border-[#4338ca] bg-[#ede9fe] text-[#4338ca]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                <FileText className="h-4 w-4" /> Text / Notes
                            </button>
                            <button type="button" onClick={() => setUploadType('pdf')}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all ${uploadType === 'pdf' ? 'border-[#4338ca] bg-[#ede9fe] text-[#4338ca]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                <File className="h-4 w-4" /> Upload PDF
                            </button>
                        </div>
                        {uploadType === 'text' ? (
                            <textarea value={textContent} onChange={e => setTextContent(e.target.value)} rows={6}
                                placeholder="Paste or type the topic content here..."
                                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4338ca]" />
                        ) : (
                            <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center hover:border-[#4338ca] transition-colors">
                                {pdfFile ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <File className="h-8 w-8 text-[#4338ca]" />
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-gray-900">{pdfFile.name}</p>
                                            <p className="text-xs text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <button type="button" onClick={() => setPdfFile(null)} className="p-1 text-gray-400 hover:text-red-500">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer">
                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-700">Click to upload PDF</p>
                                        <p className="text-xs text-gray-500 mt-1">PDF files only</p>
                                        <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files[0])} className="hidden" />
                                    </label>
                                )}
                            </div>
                        )}
                        {topic?.material && (
                            <p className="mt-2 text-xs text-[#16a34a]">✓ This topic already has material attached ({topic.material.type === 'pdf' ? topic.material.originalFilename : 'text notes'}). Uploading new content will replace it.</p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                            <input type="number" min={0} value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4338ca]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Minutes</label>
                            <input type="number" min={1} value={form.estimatedMinutes} onChange={e => setForm({ ...form, estimatedMinutes: Number(e.target.value) })}
                                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4338ca]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">XP Reward</label>
                            <input type="number" min={0} value={form.pointsReward} onChange={e => setForm({ ...form, pointsReward: Number(e.target.value) })}
                                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4338ca]" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-full px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
                        <button type="submit" disabled={saving}
                            className="rounded-full bg-[#4338ca] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#312e81] disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Main Page ─────────────────────────────────────────────────
const TeacherCourses = () => {
    const [courses, setCourses] = useState([]);
    const [expandedCourse, setExpandedCourse] = useState(null);
    const [topics, setTopics] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showCourseModal, setShowCourseModal] = useState(false);
    const [editCourse, setEditCourse] = useState(null);
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [editTopic, setEditTopic] = useState(null);
    const [topicCourseId, setTopicCourseId] = useState(null);

    const fetchCourses = useCallback(async () => {
        try {
            const res = await coursesAPI.getMyCourses();
            setCourses(res.data?.courses || []);
        } catch {
            setError('Failed to load courses.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCourses(); }, [fetchCourses]);

    const fetchTopics = async (courseId) => {
        try {
            const res = await coursesAPI.getTopics(courseId);
            setTopics(prev => ({ ...prev, [courseId]: res.data?.topics || [] }));
        } catch {
            setError('Failed to load topics.');
        }
    };

    const toggleExpand = (courseId) => {
        if (expandedCourse === courseId) {
            setExpandedCourse(null);
        } else {
            setExpandedCourse(courseId);
            if (!topics[courseId]) fetchTopics(courseId);
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm('Delete this course and all its topics?')) return;
        try {
            await coursesAPI.delete(id);
            fetchCourses();
        } catch {
            setError('Failed to delete course.');
        }
    };

    const handleDeleteTopic = async (courseId, topicId) => {
        if (!window.confirm('Delete this topic?')) return;
        try {
            await coursesAPI.deleteTopic(courseId, topicId);
            fetchTopics(courseId);
        } catch {
            setError('Failed to delete topic.');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-[#0f172a]">Course & Topic Manager</h1>
                            <p className="mt-1 text-sm text-[#475569]">Create courses, organize topics, and manage curriculum structure.</p>
                        </div>
                        <button onClick={() => { setEditCourse(null); setShowCourseModal(true); }}
                            className="inline-flex items-center gap-2 rounded-full bg-[#4338ca] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#312e81]">
                            <Plus className="h-4 w-4" /> New Course
                        </button>
                    </div>
                </section>

                {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

                {/* Course List */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e2e8f0] border-t-[#4338ca]" />
                    </div>
                ) : courses.length === 0 ? (
                    <div className="rounded-[28px] bg-white p-12 text-center shadow-xl ring-1 ring-[#e2e8f0]">
                        <BookOpen className="mx-auto h-12 w-12 text-[#94a3b8]" />
                        <p className="mt-4 text-sm text-[#64748b]">No courses yet. Create your first course to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {courses.map((course) => (
                            <div key={course._id} className="rounded-[28px] bg-white shadow-xl ring-1 ring-[#e2e8f0] overflow-hidden">
                                {/* Course Header */}
                                <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#f8fafc]"
                                    onClick={() => toggleExpand(course._id)}>
                                    <div className="flex items-center gap-4">
                                        {expandedCourse === course._id ? <ChevronUp className="h-5 w-5 text-[#4338ca]" /> : <ChevronDown className="h-5 w-5 text-[#94a3b8]" />}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-[#0f172a]">{course.title}</h3>
                                                {course.isPublished ? (
                                                    <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-xs font-medium text-[#166534]">Published</span>
                                                ) : (
                                                    <span className="rounded-full bg-[#fef9c3] px-2 py-0.5 text-xs font-medium text-[#92400e]">Draft</span>
                                                )}
                                            </div>
                                            <p className="mt-0.5 text-sm text-[#64748b]">
                                                {course.subject} • {course.difficulty} • {course.topicCount ?? 0} topics • <Users className="inline h-3.5 w-3.5" /> {course.enrolledCount ?? 0} students
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        <button onClick={() => { setEditCourse(course); setShowCourseModal(true); }}
                                            className="rounded-full p-2 text-[#475569] hover:bg-[#e2e8f0]" title="Edit course">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDeleteCourse(course._id)}
                                            className="rounded-full p-2 text-red-500 hover:bg-red-50" title="Delete course">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Topics */}
                                {expandedCourse === course._id && (
                                    <div className="border-t border-[#e2e8f0] bg-[#f8fafc] p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#64748b]">Topics</h4>
                                            <button onClick={() => { setTopicCourseId(course._id); setEditTopic(null); setShowTopicModal(true); }}
                                                className="inline-flex items-center gap-1 rounded-full bg-[#4338ca] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#312e81]">
                                                <Plus className="h-3.5 w-3.5" /> Add Topic
                                            </button>
                                        </div>

                                        {!topics[course._id] ? (
                                            <div className="flex justify-center py-4">
                                                <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#e2e8f0] border-t-[#4338ca]" />
                                            </div>
                                        ) : topics[course._id].length === 0 ? (
                                            <p className="py-4 text-center text-sm text-[#94a3b8]">No topics yet. Add the first topic above.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {topics[course._id].sort((a, b) => a.order - b.order).map((topic) => (
                                                    <div key={topic._id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#e2e8f0]">
                                                        <div className="flex items-center gap-3">
                                                            <GripVertical className="h-4 w-4 text-[#c4c4c4]" />
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold text-[#4338ca]">#{topic.order}</span>
                                                                    <span className="text-sm font-semibold text-[#0f172a]">{topic.title}</span>
                                                                    {topic.isPublished ? (
                                                                        <Eye className="h-3.5 w-3.5 text-[#16a34a]" />
                                                                    ) : (
                                                                        <EyeOff className="h-3.5 w-3.5 text-[#94a3b8]" />
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-[#94a3b8]">
                                                                    {topic.contentType} • {topic.estimatedMinutes} min • {topic.pointsReward} XP
                                                                    {topic.material && <span className="ml-1 text-[#16a34a]">• 📄 {topic.material.type === 'pdf' ? topic.material.originalFilename : 'Text'}</span>}
                                                                    {!topic.material && <span className="ml-1 text-[#f59e0b]">• No material</span>}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button onClick={() => { setTopicCourseId(course._id); setEditTopic(topic); setShowTopicModal(true); }}
                                                                className="rounded-full p-1.5 text-[#475569] hover:bg-[#e2e8f0]"><Pencil className="h-3.5 w-3.5" /></button>
                                                            <button onClick={() => handleDeleteTopic(course._id, topic._id)}
                                                                className="rounded-full p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCourseModal && (
                <CourseFormModal
                    course={editCourse}
                    onClose={() => setShowCourseModal(false)}
                    onSave={() => { setShowCourseModal(false); fetchCourses(); }}
                />
            )}
            {showTopicModal && (
                <TopicFormModal
                    courseId={topicCourseId}
                    topic={editTopic}
                    onClose={() => setShowTopicModal(false)}
                    onSave={() => { setShowTopicModal(false); fetchTopics(topicCourseId); }}
                />
            )}
        </DashboardLayout>
    );
};

export default TeacherCourses;
