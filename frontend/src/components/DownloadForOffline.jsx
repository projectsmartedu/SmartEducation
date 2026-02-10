import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Trash2, Loader2, WifiOff } from 'lucide-react';
import { isDownloaded as checkDownloaded } from '../services/offlineStorage';

/**
 * A download-for-offline button component.
 * 
 * Props:
 *  - type: 'course' | 'material'
 *  - entityId: the _id of the entity
 *  - onDownload: async () => void  — called when user clicks download
 *  - onRemove: async () => void    — called when user clicks remove
 *  - size: 'sm' | 'md'
 */
const DownloadForOffline = ({ type, entityId, onDownload, onRemove, size = 'sm' }) => {
    const [downloaded, setDownloaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let cancelled = false;
        checkDownloaded(type, entityId)
            .then((val) => {
                if (!cancelled) {
                    setDownloaded(val);
                    setChecking(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setDownloaded(false);
                    setChecking(false);
                }
            });
        return () => { cancelled = true; };
    }, [type, entityId]);

    const handleDownload = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        try {
            await onDownload();
            setDownloaded(true);
        } catch (err) {
            console.error('Download failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        try {
            await onRemove();
            setDownloaded(false);
        } catch (err) {
            console.error('Remove failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const sizeClasses = size === 'sm'
        ? 'p-1.5 rounded-lg'
        : 'px-3 py-2 rounded-xl text-xs font-semibold gap-1.5';

    if (checking) {
        return (
            <span className={`inline-flex items-center text-[#94a3b8] ${sizeClasses}`}>
                <Loader2 className="animate-spin h-4 w-4" />
            </span>
        );
    }

    if (loading) {
        return (
            <span className={`inline-flex items-center text-[#94a3b8] ${sizeClasses}`}>
                <Loader2 className={`animate-spin ${size === 'sm' ? 'h-4 w-4' : 'h-4 w-4'}`} />
                {size === 'md' && <span>Saving...</span>}
            </span>
        );
    }

    if (downloaded) {
        return (
            <div className="inline-flex items-center gap-1">
                <span className={`inline-flex items-center text-[#166534] bg-[#dcfce7] ${sizeClasses}`} title="Available offline">
                    <CheckCircle className={size === 'sm' ? 'h-4 w-4' : 'h-4 w-4'} />
                    {size === 'md' && <span>Offline Ready</span>}
                </span>
                {onRemove && (
                    <button
                        onClick={handleRemove}
                        className={`inline-flex items-center text-[#94a3b8] hover:text-red-500 transition ${sizeClasses}`}
                        title="Remove offline copy"
                    >
                        <Trash2 className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <button
            onClick={handleDownload}
            className={`inline-flex items-center text-[#4338ca] bg-[#ede9fe] hover:bg-[#ddd6fe] transition ${sizeClasses}`}
            title={`Download for offline`}
        >
            <Download className={size === 'sm' ? 'h-4 w-4' : 'h-4 w-4'} />
            {size === 'md' && <span>Save Offline</span>}
        </button>
    );
};

/**
 * Small badge showing offline-only mode
 */
export const OfflineBadge = () => (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] px-2 py-0.5 text-xs font-medium text-[#92400e]">
        <WifiOff className="h-3 w-3" />
        Offline
    </span>
);

export default DownloadForOffline;
