import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useOnlineStatus } from '../hooks/useOffline';
import {
    getOfflineStorageStats,
    getDownloads,
    removeDownload,
    clearAllOfflineData
} from '../services/offlineStorage';
import {
    Download,
    Trash2,
    HardDrive,
    BookOpen,
    FileText,
    WifiOff,
    Wifi,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

const StudentOfflineDownloads = () => {
    const isOnline = useOnlineStatus();
    const [downloads, setDownloads] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);

    const fetchData = async () => {
        try {
            const [dl, st] = await Promise.all([
                getDownloads(),
                getOfflineStorageStats()
            ]);
            setDownloads(dl);
            setStats(st);
        } catch (err) {
            console.error('Failed to load offline data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRemove = async (type, entityId) => {
        await removeDownload(type, entityId);
        fetchData();
    };

    const handleClearAll = async () => {
        if (!window.confirm('Remove all offline data? You will need to re-download content.')) return;
        setClearing(true);
        try {
            await clearAllOfflineData();
            fetchData();
        } finally {
            setClearing(false);
        }
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <section className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-[#0f172a]">Offline Downloads</h1>
                            <p className="mt-1 text-sm text-[#475569]">
                                Manage content saved for offline access.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {isOnline ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-medium text-[#166534]">
                                    <Wifi className="h-3.5 w-3.5" /> Online
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-medium text-[#92400e]">
                                    <WifiOff className="h-3.5 w-3.5" /> Offline
                                </span>
                            )}
                        </div>
                    </div>
                </section>

                {/* Stats */}
                {stats && (
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-[#ede9fe] p-3">
                                    <BookOpen className="h-5 w-5 text-[#4338ca]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#0f172a]">{stats.courseCount}</p>
                                    <p className="text-xs text-[#64748b]">Courses saved</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-[#dbeafe] p-3">
                                    <FileText className="h-5 w-5 text-[#1d4ed8]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#0f172a]">{stats.materialCount}</p>
                                    <p className="text-xs text-[#64748b]">Materials saved</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-[#fef3c7] p-3">
                                    <HardDrive className="h-5 w-5 text-[#92400e]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#0f172a]">{stats.totalSizeMB} MB</p>
                                    <p className="text-xs text-[#64748b]">Storage used</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Downloads List */}
                <section className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-[#0f172a]">
                            Downloaded Content ({downloads.length})
                        </h2>
                        {downloads.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                disabled={clearing}
                                className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Clear All
                            </button>
                        )}
                    </div>

                    {downloads.length === 0 ? (
                        <div className="py-12 text-center">
                            <Download className="mx-auto h-12 w-12 text-[#cbd5e1]" />
                            <p className="mt-3 text-sm text-[#94a3b8]">No content downloaded yet.</p>
                            <p className="mt-1 text-xs text-[#cbd5e1]">
                                Go to Courses or Materials and tap the download icon to save content for offline use.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {downloads.map((dl) => (
                                <div
                                    key={dl.id}
                                    className="flex items-center justify-between rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4 transition hover:shadow"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`rounded-xl p-2 ${dl.type === 'course' ? 'bg-[#ede9fe]' : 'bg-[#dbeafe]'}`}>
                                            {dl.type === 'course' ? (
                                                <BookOpen className="h-4 w-4 text-[#4338ca]" />
                                            ) : (
                                                <FileText className="h-4 w-4 text-[#1d4ed8]" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[#0f172a]">{dl.title}</p>
                                            <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
                                                <span className="capitalize">{dl.type}</span>
                                                <span>•</span>
                                                <span>{new Date(dl.downloadedAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{(dl.size / 1024).toFixed(0)} KB</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-[#16a34a]" />
                                        <button
                                            onClick={() => handleRemove(dl.type, dl.entityId)}
                                            className="rounded-lg p-1.5 text-[#94a3b8] hover:bg-red-50 hover:text-red-500 transition"
                                            title="Remove offline copy"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Info */}
                <section className="rounded-2xl bg-[#ede9fe] p-5">
                    <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-[#4338ca]" />
                        <div className="text-sm text-[#4338ca]">
                            <p className="font-semibold">How offline mode works</p>
                            <ul className="mt-1 space-y-1 text-xs">
                                <li>• Downloaded courses and materials are available without internet</li>
                                <li>• Your progress is saved locally and syncs when you reconnect</li>
                                <li>• AI features (chatbot, doubt support) require an internet connection</li>
                                <li>• Revisions and progress data are cached automatically</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
};

export default StudentOfflineDownloads;
