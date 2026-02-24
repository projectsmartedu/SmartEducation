import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOnlineStatus } from '../../hooks/useOffline';
import Navbar from './Navbar';
import {
    LayoutDashboard,
    Map,
    CalendarClock,
    TrendingUp,
    MessageSquare,
    BookOpen,
    Users2,
    GraduationCap,
    UserCog,
    LogOut,
    ArrowLeft,
    Menu,
    X,
    Trophy,
    User,
    Download,
    WifiOff
} from 'lucide-react';

const studentLinks = [
    { label: 'Dashboard', href: '/student', icon: LayoutDashboard, needsOnline: true },
    { label: 'My Profile', href: '/student/profile', icon: User, needsOnline: true },
    { label: 'My Courses', href: '/student/courses', icon: BookOpen, needsOnline: false },
    { label: 'Knowledge Map', href: '/student/knowledge-map', icon: Map, needsOnline: true },
    { label: 'Revisions', href: '/student/revisions', icon: CalendarClock, needsOnline: true },
    { label: 'Progress', href: '/student/progress', icon: TrendingUp, needsOnline: true },
    { label: 'Leaderboard', href: '/student/leaderboard', icon: Trophy, needsOnline: true },
    { label: 'Course Materials', href: '/student/materials', icon: GraduationCap, needsOnline: false },
    { label: 'Offline Downloads', href: '/student/offline-downloads', icon: Download, needsOnline: false }
];

const teacherLinks = [
    { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { label: 'Manage Courses', href: '/teacher/courses', icon: BookOpen },
    { label: 'Manage Students', href: '/teacher/students', icon: Users2 },
    { label: 'Course Materials', href: '/teacher/materials', icon: GraduationCap }
];

const adminLinks = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Manage Users', href: '/admin/users', icon: UserCog }
];

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const isOnline = useOnlineStatus();

    const role = user?.role;
    const allLinks =
        role === 'teacher' ? teacherLinks : role === 'admin' ? adminLinks : studentLinks;

    // When offline, only show links that work without internet
    const links = isOnline ? allLinks : allLinks.filter((l) => !l.needsOnline);

    const basePath = role === 'teacher' ? '/teacher' : role === 'admin' ? '/admin' : '/student';
    const isSubpage = location.pathname !== basePath;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const sidebarContent = (
        <div className="flex h-full flex-col justify-between">
            {/* Brand */}
            <div>
                <div className="flex items-center gap-3 px-5 py-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4338ca]">
                        <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#0f172a]">Smart Education</p>
                        <p className="text-xs capitalize text-[#64748b]">{role} Portal</p>
                    </div>
                </div>

                {/* User info */}
                <div className="mx-4 mb-4 rounded-2xl bg-[#f8fafc] p-3">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4338ca] text-xs font-bold text-white">
                            {user?.name?.charAt(0) ?? '?'}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#0f172a]">{user?.name}</p>
                            <p className="truncate text-xs text-[#64748b]">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Back button on subpages */}
                {isSubpage && (
                    <button
                        onClick={() => navigate(basePath)}
                        className="mx-4 mb-3 flex w-[calc(100%-2rem)] items-center gap-2 rounded-2xl bg-[#ede9fe] px-4 py-2.5 text-sm font-semibold text-[#4338ca] transition hover:bg-[#ddd6fe]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </button>
                )}

                {/* Offline mode indicator */}
                {!isOnline && (
                    <div className="mx-4 mb-3 flex items-center gap-2 rounded-2xl bg-[#fef3c7] px-4 py-2.5 text-xs font-semibold text-[#92400e]">
                        <WifiOff className="h-4 w-4" />
                        Offline Mode
                    </div>
                )}

                {/* Nav links */}
                <nav className="space-y-1 px-4">
                    {links.map((item) => {
                        const active = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 ${active
                                    ? 'bg-[#4338ca] text-white shadow-lg'
                                    : 'text-[#475569] hover:bg-[#f1f5f9]'
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Logout */}
            <div className="px-4 pb-6">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-[#ef4444] transition hover:bg-[#fef2f2]"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f6f1eb]">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#e2e8f0] bg-white lg:block">
                {sidebarContent}
            </aside>

            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed left-4 top-4 z-50 rounded-xl bg-white p-2 shadow-lg lg:hidden"
            >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[#e2e8f0] bg-white transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {sidebarContent}
            </aside>

            {/* Main content */}
            <div className="lg:ml-64">
                <Navbar />
                <main className="min-h-screen pt-20">
                    <div className="px-4 pb-10 sm:px-6 xl:px-12">{children}</div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
