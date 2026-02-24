import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    LogOut,
    GraduationCap,
    UserCog,
    BookOpen,
    FileText,
    Sparkles,
    Map,
    CalendarClock,
    TrendingUp,
    User
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getNavItems = () => {
        switch (user?.role) {
            case 'admin':
                return [
                    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
                    { path: '/admin/users', icon: Users, label: 'Manage Users' }
                ];
            case 'teacher':
                return [
                    { path: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
                    { path: '/teacher/courses', icon: BookOpen, label: 'My Courses' },
                    { path: '/teacher/materials', icon: FileText, label: 'Course Materials' },
                    { path: '/teacher/students', icon: GraduationCap, label: 'My Students' }
                ];
            case 'student':
                    return [
                    { path: '/student', icon: LayoutDashboard, label: 'Dashboard' },
                    { path: '/student/profile', icon: User, label: 'My Profile' },
                    { path: '/student/courses', icon: BookOpen, label: 'My Courses' },
                    { path: '/student/materials', icon: FileText, label: 'Course Materials' },
                    { path: '/student/knowledge-map', icon: Map, label: 'Knowledge Map' },
                    { path: '/student/revisions', icon: CalendarClock, label: 'Revisions' },
                    { path: '/student/progress', icon: TrendingUp, label: 'Progress' },
                    { path: '/student/chatbot', icon: MessageSquare, label: 'AI Chatbot' }
                ];
            default:
                return [];
        }
    };

    const getRoleIcon = () => {
        switch (user?.role) {
            case 'admin':
                return <UserCog className="w-8 h-8 text-black" />;
            case 'teacher':
                return <BookOpen className="w-8 h-8 text-black" />;
            case 'student':
                return <GraduationCap className="w-8 h-8 text-black" />;
            default:
                return <Users className="w-8 h-8 text-black" />;
        }
    };

    const navItems = getNavItems();

    return (
        <aside className="w-64 bg-gradient-to-b from-white to-gray-50 shadow-lg h-screen fixed left-0 top-0 flex flex-col border-r border-gray-200">
            {/* Logo Section */}
            <div className="p-6 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-md">
                        {getRoleIcon()}
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg">Smart Education</h1>
                        <p className="text-gray-300 text-sm capitalize">{user?.role} Portal</p>
                    </div>
                </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-100 bg-white/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-semibold shadow-md">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                end={item.path === `/${user?.role}`}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-100 bg-white/50">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 rounded-xl transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
