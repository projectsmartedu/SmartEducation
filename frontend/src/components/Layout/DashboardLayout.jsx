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
    BookOpen,
    Users2,
    GraduationCap,
    UserCog,
    LogOut,
    Menu,
    X,
    Trophy,
    User,
    Download,
    WifiOff
} from 'lucide-react';

const studentSections = [
    {
        title: 'Overview',
        links: [
            { label: 'Dashboard', href: '/student', icon: LayoutDashboard, needsOnline: true },
            { label: 'My Profile', href: '/student/profile', icon: User, needsOnline: true },
            { label: 'Progress', href: '/student/progress', icon: TrendingUp, needsOnline: true },
            { label: 'Leaderboard', href: '/student/leaderboard', icon: Trophy, needsOnline: true }
        ]
    },
    {
        title: 'Learning Resources',
        links: [
            { label: 'My Courses', href: '/student/courses', icon: BookOpen, needsOnline: false },
            { label: 'Course Materials', href: '/student/materials', icon: GraduationCap, needsOnline: false },
            { label: 'Offline Downloads', href: '/student/offline-downloads', icon: Download, needsOnline: false }
        ]
    },
    {
        title: 'Learning Insights',
        links: [
            { label: 'Knowledge Map', href: '/student/knowledge-map', icon: Map, needsOnline: true },
            { label: 'Revisions', href: '/student/revisions', icon: CalendarClock, needsOnline: true }
        ]
    }
];

const teacherSections = [
    {
        title: 'Overview',
        links: [{ label: 'Dashboard', href: '/teacher', icon: LayoutDashboard }]
    },
    {
        title: 'Career Tools',
        links: [
            { label: 'Manage Courses', href: '/teacher/courses', icon: BookOpen },
            { label: 'Manage Students', href: '/teacher/students', icon: Users2 },
            { label: 'Course Materials', href: '/teacher/materials', icon: GraduationCap }
        ]
    }
];

const adminSections = [
    {
        title: 'Overview',
        links: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }]
    },
    {
        title: 'Management',
        links: [{ label: 'Manage Users', href: '/admin/users', icon: UserCog }]
    }
];

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const isOnline = useOnlineStatus();

    const role = user?.role;
    const allSections =
        role === 'teacher' ? teacherSections : role === 'admin' ? adminSections : studentSections;

    // When offline, only show links that work without internet
    const sections = allSections
        .map((section) => ({
            ...section,
            links: isOnline ? section.links : section.links.filter((link) => !link.needsOnline)
        }))
        .filter((section) => section.links.length > 0);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const sidebarContent = (
        <div className="flex h-full flex-col justify-between overflow-y-auto">
            <div>
                {/* User info */}
                <div className="mx-4 mb-5 mt-5 rounded-2xl border border-[#dbe3f1] bg-gradient-to-br from-[#f8fafc] to-white p-3.5 shadow-sm">
                    <div className="flex items-center gap-3.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4338ca] text-sm font-bold text-white shadow-sm">
                            {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-base font-semibold leading-5 text-[#0f172a]">{user?.name}</p>
                            <p className="truncate text-xs text-[#64748b]">{user?.email}</p>
                            <span className="mt-1 inline-flex rounded-full bg-[#eef2ff] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#4338ca]">
                                {user?.role || 'user'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Offline mode indicator */}
                {!isOnline && (
                    <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-2.5 text-xs font-semibold text-[#92400e]">
                        <WifiOff className="h-4 w-4" />
                        Offline Mode
                    </div>
                )}

                {/* Nav links */}
                <nav className="space-y-5 px-4">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wide text-[#64748b]">
                                {section.title}
                            </p>
                            <div className="space-y-1">
                                {section.links.map((item) => {
                                    const active = location.pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            to={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active
                                                ? 'bg-[#4338ca] text-white shadow-sm'
                                                : 'text-[#334155] hover:bg-[#f1f5f9]'
                                                }`}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Logout */}
            <div className="px-4 pb-6">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#ef4444] transition hover:bg-[#fef2f2]"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-[#e2e8f0] bg-white lg:block">
                {sidebarContent}
            </aside>

            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed left-4 top-4 z-50 rounded-xl border border-[#e2e8f0] bg-white p-2 shadow-sm lg:hidden"
            >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-[#e2e8f0] bg-white transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {sidebarContent}
            </aside>

            {/* Main content */}
            <div className="lg:ml-72">
                <Navbar />
                <main className="min-h-screen pt-20">
                    <div className="px-4 pb-10 sm:px-6 lg:px-8 xl:px-12">
                        <div className="mx-auto max-w-6xl">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
