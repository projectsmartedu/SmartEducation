import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { materialsAPI } from '../services/api';
import {
    FileText,
    Search,
    Filter,
    BookOpen,
    Clock,
    File,
    Eye,
    X,
    ChevronDown,
    User,
    Loader,
    AlertCircle,
    WifiOff,
    Download,
    CheckCircle,
    Trash2
} from 'lucide-react';
import {
    saveMaterialOffline,
    getAllMaterialsOffline,
    removeMaterialOffline,
    getMaterialOffline,
    isDownloaded as checkIsDownloaded
} from '../services/offlineStorage';

const StudentMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);
    const [offlineMode, setOfflineMode] = useState(false);
    const [downloadedIds, setDownloadedIds] = useState(new Set());

    const fetchMaterials = async (subject = '', topic = '') => {
        if (!navigator.onLine) {
            // Load from offline storage
            try {
                const offlineMaterials = await getAllMaterialsOffline();
                setMaterials(offlineMaterials);
                setOfflineMode(true);
            } catch {
                setError('Failed to load offline materials');
            } finally {
                setLoading(false);
            }
            return;
        }
        try {
            const params = {};
            if (subject) params.subject = subject;
            if (topic) params.topic = topic;

            const response = await materialsAPI.getAll(params);
            setMaterials(response.data.materials || []);
            setOfflineMode(false);
        } catch (error) {
            console.error('Error fetching materials:', error);
            // Fallback to offline
            try {
                const offlineMaterials = await getAllMaterialsOffline();
                if (offlineMaterials.length > 0) {
                    setMaterials(offlineMaterials);
                    setOfflineMode(true);
                } else {
                    setError('Failed to load materials');
                }
            } catch {
                setError('Failed to load materials');
            }
        } finally {
            setLoading(false);
        }
    };

    // Check which materials are downloaded
    const refreshDownloadedIds = async (materialsList) => {
        const ids = new Set();
        for (const m of materialsList) {
            const dl = await checkIsDownloaded('material', m._id);
            if (dl) ids.add(m._id);
        }
        setDownloadedIds(ids);
    };

    const handleDownloadMaterial = async (material) => {
        try {
            // Fetch full material content
            const response = await materialsAPI.getById(material._id);
            const fullMaterial = response.data?.material || response.data;
            await saveMaterialOffline(fullMaterial);
            setDownloadedIds(prev => new Set([...prev, material._id]));
        } catch (err) {
            setError('Failed to download material');
        }
    };

    const handleRemoveDownload = async (materialId) => {
        await removeMaterialOffline(materialId);
        setDownloadedIds(prev => {
            const next = new Set(prev);
            next.delete(materialId);
            return next;
        });
    };

    const fetchSubjects = async () => {
        try {
            const response = await materialsAPI.getSubjects();
            setSubjects(response.data.subjects || []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchTopics = async (subject) => {
        try {
            const response = await materialsAPI.getTopics(subject);
            setTopics(response.data.topics || []);
        } catch (error) {
            console.error('Error fetching topics:', error);
        }
    };

    useEffect(() => {
        fetchMaterials();
        fetchSubjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (materials.length > 0) {
            refreshDownloadedIds(materials);
        }
    }, [materials]);

    useEffect(() => {
        if (selectedSubject) {
            fetchTopics(selectedSubject);
        } else {
            setTopics([]);
            setSelectedTopic('');
        }
    }, [selectedSubject]);

    useEffect(() => {
        fetchMaterials(selectedSubject, selectedTopic);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSubject, selectedTopic]);

    const handleView = async (material) => {
        setViewLoading(true);
        try {
            if (navigator.onLine) {
                const response = await materialsAPI.getById(material._id);
                setSelectedMaterial(response.data);
                setShowViewModal(true);
            } else {
                // Offline — try loading from IndexedDB
                const offlineMaterial = await getMaterialOffline(material._id);
                if (offlineMaterial) {
                    setSelectedMaterial({ material: offlineMaterial });
                    setShowViewModal(true);
                } else {
                    setError('This material is not available offline. Download it while online.');
                }
            }
        } catch (error) {
            // Network error — try offline fallback
            try {
                const offlineMaterial = await getMaterialOffline(material._id);
                if (offlineMaterial) {
                    setSelectedMaterial({ material: offlineMaterial });
                    setShowViewModal(true);
                } else {
                    setError('Failed to load material. Download it for offline access.');
                }
            } catch {
                setError('Failed to load material details');
            }
        } finally {
            setViewLoading(false);
        }
    };

    const clearFilters = () => {
        setSelectedSubject('');
        setSelectedTopic('');
        setSearchTerm('');
    };

    const filteredMaterials = materials.filter(m =>
        m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const hasActiveFilters = selectedSubject || selectedTopic || searchTerm;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Materials</h1>
                    <p className="text-gray-600 mt-1">Browse and study from uploaded course materials</p>
                </div>

                {/* Stats Bar */}
                <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#64748b]">Available Materials</p>
                            <p className="mt-1 text-4xl font-bold text-[#0f172a]">{materials.length}</p>
                            <p className="mt-2 text-sm text-[#94a3b8]">
                                {subjects.length} subjects • {hasActiveFilters ? 'Filtered' : offlineMode ? 'Offline mode' : 'All materials'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {offlineMode && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-medium text-[#92400e]">
                                    <WifiOff className="h-3.5 w-3.5" /> Offline
                                </span>
                            )}
                            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                                <BookOpen className="h-10 w-10 text-[#334155]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 bg-gray-100 border border-gray-300 rounded-xl flex items-center gap-3 text-gray-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                        <button onClick={() => setError('')} className="ml-auto p-1 hover:bg-gray-200 rounded-lg">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search materials..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center gap-2 px-4 py-3 border rounded-xl transition-all ${showFilters || hasActiveFilters
                                ? 'border-[#0f172a] bg-[#0f172a] text-white'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <Filter className="w-5 h-5" />
                            Filters
                            {hasActiveFilters && (
                                <span className="w-2 h-2 bg-white rounded-full"></span>
                            )}
                        </button>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Subject Filter */}
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                    <div className="relative">
                                        <select
                                            value={selectedSubject}
                                            onChange={(e) => setSelectedSubject(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                        >
                                            <option value="">All Subjects</option>
                                            {subjects.map((subject) => (
                                                <option key={subject} value={subject}>{subject}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Topic Filter */}
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                                    <div className="relative">
                                        <select
                                            value={selectedTopic}
                                            onChange={(e) => setSelectedTopic(e.target.value)}
                                            disabled={!selectedSubject}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">All Topics</option>
                                            {topics.map((topic) => (
                                                <option key={topic} value={topic}>{topic}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Clear Filters */}
                                {hasActiveFilters && (
                                    <div className="flex items-end">
                                        <button
                                            onClick={clearFilters}
                                            className="px-4 py-3 text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Materials Grid */}
                {loading ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading materials...</p>
                    </div>
                ) : filteredMaterials.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No materials found</h3>
                        <p className="text-gray-500 mt-1">
                            {hasActiveFilters
                                ? 'Try adjusting your filters or search term'
                                : 'No course materials have been uploaded yet'
                            }
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 px-4 py-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMaterials.map((material) => (
                            <div
                                key={material._id}
                                onClick={() => handleView(material)}
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-gradient-to-br group-hover:from-gray-700 group-hover:to-gray-900 group-hover:text-white transition-all">
                                        {material.type === 'pdf' ? (
                                            <File className="w-6 h-6" />
                                        ) : (
                                            <FileText className="w-6 h-6" />
                                        )}
                                    </div>
                                    <button
                                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Download for offline button */}
                                <div className="mb-3 flex items-center justify-end">
                                    {downloadedIds.has(material._id) ? (
                                        <div className="flex items-center gap-1">
                                            <span className="inline-flex items-center gap-1 rounded-lg bg-[#dcfce7] px-2 py-1 text-xs font-medium text-[#166534]">
                                                <CheckCircle className="h-3.5 w-3.5" /> Offline Ready
                                            </span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemoveDownload(material._id); }}
                                                className="p-1 text-gray-400 hover:text-red-500 rounded transition"
                                                title="Remove offline copy"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDownloadMaterial(material); }}
                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#4338ca] bg-[#ede9fe] hover:bg-[#ddd6fe] transition"
                                            title="Save for offline"
                                            disabled={!navigator.onLine}
                                        >
                                            <Download className="h-3.5 w-3.5" /> Save Offline
                                        </button>
                                    )}
                                </div>

                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-black">
                                    {material.title}
                                </h3>

                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
                                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                                        {material.subject}
                                    </span>
                                    <span className="px-2 py-0.5 bg-gray-50 rounded text-xs">
                                        {material.topic}
                                    </span>
                                </div>

                                {material.description && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{material.description}</p>
                                )}

                                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        <span className="line-clamp-1">
                                            {material.uploadedBy?.name || 'Teacher'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(material.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* View Material Modal */}
            {showViewModal && selectedMaterial && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-semibold text-gray-900 truncate">
                                    {selectedMaterial.material?.title}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
                                    <span className="px-2 py-0.5 bg-gray-100 rounded font-medium">
                                        {selectedMaterial.material?.subject}
                                    </span>
                                    <span>•</span>
                                    <span>{selectedMaterial.material?.topic}</span>
                                    <span>•</span>
                                    <span>{selectedMaterial.wordCount} words</span>
                                    <span>•</span>
                                    <span>{selectedMaterial.readingTime} min read</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-4"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Description */}
                        {selectedMaterial.material?.description && (
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <p className="text-gray-600">{selectedMaterial.material.description}</p>
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="prose prose-sm max-w-none">
                                <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-6 rounded-xl font-sans leading-relaxed">
                                    {selectedMaterial.material?.content}
                                </pre>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>Uploaded by {selectedMaterial.material?.uploadedBy?.name || 'Teacher'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                        {new Date(selectedMaterial.material?.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading Overlay for View */}
            {viewLoading && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
                        <Loader className="w-8 h-8 text-black animate-spin" />
                        <p className="mt-4 text-gray-600">Loading material...</p>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default StudentMaterials;
