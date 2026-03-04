import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated && user) {
        const dashboardRoutes = {
            admin: '/admin',
            teacher: '/teacher',
            student: '/student'
        };
        return <Navigate to={dashboardRoutes[user.role]} replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userData = await login(email, password);
            const dashboardRoutes = {
                admin: '/admin',
                teacher: '/teacher',
                student: '/student'
            };
            navigate(dashboardRoutes[userData.role]);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = (role) => {
        const credentials = {
            admin: { email: 'admin@education.com', password: 'admin123' },
            teacher: { email: 'teacher@education.com', password: 'teacher123' },
            student: { email: 'student@education.com', password: 'student123' }
        };
        setEmail(credentials[role].email);
        setPassword(credentials[role].password);
        setSelectedRole(role);
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#eef2ff_0%,#f8fafc_45%,#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
                <div className="grid w-full overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] lg:grid-cols-2">
                    <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
                        <div className="w-full max-w-md">
                            <div className="mb-8">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#64748b]">Smart Education Platform</p>
                                <h1 className="mt-3 text-3xl font-semibold text-[#0f172a]">Sign in</h1>
                                <p className="mt-2 text-sm text-[#64748b]">Access your dashboard using your institutional account.</p>
                            </div>

                            <div className="mb-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">Quick demo roles</p>
                                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {[
                                        { role: 'admin', label: 'Admin' },
                                        { role: 'teacher', label: 'Teacher' },
                                        { role: 'student', label: 'Student' }
                                    ].map((item) => (
                                        <button
                                            key={item.role}
                                            onClick={() => quickLogin(item.role)}
                                            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${selectedRole === item.role
                                                ? 'border-[#4338ca] bg-[#eef2ff] text-[#312e81]'
                                                : 'border-[#e2e8f0] bg-white text-[#334155] hover:bg-[#f8fafc]'
                                                }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-3 text-[#b91c1c]">
                                    <AlertCircle className="h-5 w-5" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[#e2e8f0] bg-white p-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#334155]">Email address</label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@education.com"
                                            required
                                            className="w-full rounded-xl border border-[#e2e8f0] bg-white px-11 py-3 text-sm text-[#0f172a] focus:border-[#4338ca] focus:outline-none focus:ring-2 focus:ring-[#c7d2fe]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#334155]">Password</label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            required
                                            className="w-full rounded-xl border border-[#e2e8f0] bg-white px-11 py-3 text-sm text-[#0f172a] focus:border-[#4338ca] focus:outline-none focus:ring-2 focus:ring-[#c7d2fe]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] transition hover:text-[#475569]"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-[#64748b]">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" className="h-4 w-4 rounded border-[#cbd5e1] text-[#4338ca] focus:ring-[#4338ca]" />
                                        <span>Remember me</span>
                                    </label>
                                    <button type="button" className="font-medium text-[#475569] hover:text-[#0f172a]">
                                        Forgot password?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4338ca] py-3 text-sm font-semibold text-white transition hover:bg-[#312e81] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {loading ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            <span>Signing in</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign in</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="mt-6 text-center text-xs text-[#94a3b8]">
                                Need access?{' '}
                                <button type="button" className="font-semibold text-[#4338ca] hover:text-[#312e81]">
                                    Contact admin
                                </button>
                            </p>
                        </div>
                    </div>

                    <div className="hidden border-l border-[#e2e8f0] bg-[#f8fafc] p-10 lg:flex lg:flex-col lg:justify-center">
                        <h2 className="text-2xl font-semibold text-[#0f172a]">Smart Education</h2>
                        <p className="mt-3 text-sm leading-relaxed text-[#64748b]">
                            A focused platform for courses, materials, revisions, and progress tracking in one workspace.
                        </p>
                        <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                            <div className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-2">
                                <p className="text-[#64748b]">Active users</p>
                                <p className="mt-1 text-lg font-semibold text-[#0f172a]">24/7</p>
                            </div>
                            <div className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-2">
                                <p className="text-[#64748b]">Platform status</p>
                                <p className="mt-1 text-lg font-semibold text-[#16a34a]">Online</p>
                            </div>
                        </div>
                        <div className="mt-8 space-y-3 text-sm text-[#334155]">
                            <div className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3">Centralized course and material access</div>
                            <div className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3">Structured revision and knowledge mapping</div>
                            <div className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3">Progress visibility for students and faculty</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
