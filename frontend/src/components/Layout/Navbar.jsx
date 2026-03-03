import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell } from 'lucide-react';
import { notificationsAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const Navbar = () => {
    const { user, notifications: ctxNotifs = [] } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifs, setLoadingNotifs] = useState(false);

    useEffect(() => {
        if (showNotifications) fetchNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showNotifications]);

    return (
        <header className="fixed top-0 left-0 right-0 z-10 h-16 border-b border-gray-200 bg-white shadow-sm lg:left-64">
            <div className="flex h-full items-center justify-between px-4 sm:px-6">
                {/* Page Title */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">
                        Welcome back, {user?.name?.split(' ')[0]}!
                    </h2>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Role Badge */}
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700 sm:px-3 sm:text-sm">
                        {user?.role}
                    </span>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 text-gray-600 hover:text-gray-900 relative"
                        >
                            <Bell className="w-5 h-5" />
                            {(notifications.length > 0 ? notifications : ctxNotifs).filter(n => !n.read).length > 0 && (
                                <span className="absolute top-0 right-0 -mt-0.5 -mr-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                    {(notifications.length > 0 ? notifications : ctxNotifs).filter(n => !n.read).length}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-white rounded-lg shadow-lg border border-gray-200">
                                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                                    <button className="text-xs text-gray-500" onClick={() => fetchNotifications()}>Refresh</button>
                                </div>
                                <div>
                                    {loadingNotifs && (
                                        <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
                                    )}
                                    {!loadingNotifs && (notifications.length === 0 && ctxNotifs.length === 0) && (
                                        <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
                                    )}
                                    {!loadingNotifs && (notifications.length > 0 ? notifications : ctxNotifs).map((n) => (
                                        <div key={n._id} className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-start ${!n.read ? 'bg-white' : 'bg-gray-50'}`}>
                                            <div>
                                                <div className={`text-sm ${!n.read ? 'font-medium text-gray-800' : 'text-gray-700'}`}>{n.message}</div>
                                                <div className="text-xs text-gray-500 mt-1">{n.data?.topicId ? 'Topic update' : n.type} • {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                                            </div>
                                            <div className="ml-2">
                                                {!n.read && (
                                                    <button className="text-xs text-blue-600" onClick={async (e) => { e.stopPropagation(); await markRead(n._id); }}>Mark</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-2 text-center">
                                    <Link to="/notifications" className="text-sm text-blue-600">View all</Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );

    async function fetchNotifications() {
        setLoadingNotifs(true);
        try {
            const res = await notificationsAPI.getMy({ limit: 20 });
            setNotifications(res.data.notifications || []);
        } catch (e) {
            console.error('Failed to fetch notifications', e);
        } finally {
            setLoadingNotifs(false);
        }
    }

    async function markRead(id) {
        try {
            await notificationsAPI.markAsRead(id);
            setNotifications(prev => prev.map(p => p._id === id ? { ...p, read: true } : p));
        } catch (e) {
            console.error('Failed to mark read', e);
        }
    }
};

export default Navbar;
