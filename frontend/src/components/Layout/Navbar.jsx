import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Moon } from 'lucide-react';
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
        <header className="fixed left-0 right-0 top-0 z-10 h-16 border-b border-[#e2e8f0] bg-white/95 backdrop-blur-sm lg:left-72">
            <div className="flex h-full items-center justify-between pl-12 pr-4 sm:pl-6 sm:pr-6 lg:px-8">
                {/* Page Title */}
                <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-[#0f172a] sm:text-xl">
                        Welcome back, {user?.name?.split(' ')[0]}!
                    </h2>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Role Badge */}
                    <span className="hidden rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-xs font-semibold text-[#475569] sm:inline-flex">
                        {user?.role}
                    </span>

                    <button
                        className="rounded-full border border-[#e2e8f0] bg-white p-2 text-[#334155] transition hover:bg-[#f8fafc]"
                        type="button"
                        aria-label="Theme"
                    >
                        <Moon className="h-4 w-4" />
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative rounded-full border border-[#e2e8f0] bg-white p-2 text-[#334155] transition hover:bg-[#f8fafc]"
                        >
                            <Bell className="w-5 h-5" />
                            {(notifications.length > 0 ? notifications : ctxNotifs).filter(n => !n.read).length > 0 && (
                                <span className="absolute right-0 top-0 -mr-0.5 -mt-0.5 inline-flex items-center justify-center rounded-full bg-[#4338ca] px-1.5 py-0.5 text-xs font-bold leading-none text-white">
                                    {(notifications.length > 0 ? notifications : ctxNotifs).filter(n => !n.read).length}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 max-h-96 w-80 overflow-auto rounded-2xl border border-[#e2e8f0] bg-white shadow-xl">
                                <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-2.5">
                                    <h3 className="font-semibold text-[#0f172a]">Notifications</h3>
                                    <button className="text-xs font-semibold text-[#4338ca]" onClick={() => fetchNotifications()}>Refresh</button>
                                </div>
                                <div>
                                    {loadingNotifs && (
                                        <div className="px-4 py-3 text-sm text-[#64748b]">Loading...</div>
                                    )}
                                    {!loadingNotifs && (notifications.length === 0 && ctxNotifs.length === 0) && (
                                        <div className="px-4 py-3 text-sm text-[#64748b]">No notifications</div>
                                    )}
                                    {!loadingNotifs && (notifications.length > 0 ? notifications : ctxNotifs).map((n) => (
                                        <div key={n._id} className={`flex items-start justify-between border-b border-[#f1f5f9] px-4 py-3 ${!n.read ? 'bg-white' : 'bg-[#f8fafc]'}`}>
                                            <div>
                                                <div className={`text-sm ${!n.read ? 'font-medium text-[#0f172a]' : 'text-[#334155]'}`}>{n.message}</div>
                                                <div className="mt-1 text-xs text-[#64748b]">{n.data?.topicId ? 'Topic update' : n.type} • {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                                            </div>
                                            <div className="ml-2">
                                                {!n.read && (
                                                    <button className="text-xs font-semibold text-[#4338ca]" onClick={async (e) => { e.stopPropagation(); await markRead(n._id); }}>Mark</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-2 text-center">
                                    <Link to="/notifications" className="text-sm font-semibold text-[#4338ca]">View all</Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3b82f6] text-sm font-bold text-white">
                        {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </span>
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
