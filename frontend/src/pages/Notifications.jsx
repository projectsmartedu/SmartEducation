import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
    const { notifications: ctxNotifs = [] } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const res = await notificationsAPI.getMy({ limit: 50, page: p });
            const list = res.data.notifications || [];
            // Merge real-time ones from context, dedupe by _id (context ones usually at front)
            const merged = [...ctxNotifs, ...list].filter((v, i, a) => v && a.findIndex(x => x._id === v._id) === i);
            setNotifications(merged);
        } catch (e) {
            // fallback to context notifications
            setNotifications(ctxNotifs || []);
        } finally {
            setLoading(false);
        }
    }, [ctxNotifs]);

    useEffect(() => { loadNotifications(1); }, [loadNotifications]);

    const markRead = async (id) => {
        try {
            await notificationsAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (e) {
            console.error('Mark read failed', e);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
                    {loading && <div className="text-sm text-gray-500">Loading...</div>}
                    {!loading && notifications.length === 0 && (
                        <div className="text-sm text-gray-500">No notifications yet.</div>
                    )}
                    <div className="mt-4 space-y-2">
                        {notifications.map(n => (
                            <div key={n._id} className={`p-4 rounded-lg border ${!n.read ? 'bg-white' : 'bg-gray-50'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium text-gray-800">{n.message}</div>
                                        <div className="text-xs text-gray-500 mt-1">{n.type} • {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                                    </div>
                                    <div>
                                        {!n.read && <button onClick={() => markRead(n._id)} className="text-sm text-blue-600">Mark as read</button>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Notifications;
