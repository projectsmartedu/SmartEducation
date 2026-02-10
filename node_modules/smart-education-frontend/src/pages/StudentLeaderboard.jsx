import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { gamificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Flame, Crown, Star } from 'lucide-react';

const RANK_ICONS = [Crown, Trophy, Medal];
const RANK_COLORS = ['text-[#f59e0b]', 'text-[#6b7280]', 'text-[#b45309]'];

const StudentLeaderboard = () => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [type, setType] = useState('total');
    const [badges, setBadges] = useState({ earned: [], available: [] });
    const [loading, setLoading] = useState(true);
    const [badgesLoading, setBadgesLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
        fetchBadges();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await gamificationAPI.getLeaderboard({ type });
            setLeaderboard(res.data?.leaderboard || []);
            setMyRank(res.data?.myRank ?? null);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBadges = async () => {
        setBadgesLoading(true);
        try {
            const res = await gamificationAPI.getMyBadges();
            setBadges({
                earned: res.data?.earned || [],
                available: res.data?.available || []
            });
        } catch (error) {
            console.error('Error loading badges:', error);
        } finally {
            setBadgesLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <section className="rounded-[28px] bg-gradient-to-br from-[#fef9c3] via-[#fef3c7] to-[#ede9fe] p-6 shadow-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#4338ca]">Gamification</p>
                    <h1 className="mt-2 text-2xl font-semibold text-[#0f172a]">Leaderboard & Badges</h1>
                    <p className="mt-1 text-sm text-[#475569]">
                        Compete with your peers and earn badges by completing lessons, revisions, and maintaining streaks.
                    </p>
                    {myRank && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2">
                            <Star className="h-4 w-4 text-[#f59e0b]" />
                            <span className="text-sm font-semibold text-[#0f172a]">Your Rank: #{myRank}</span>
                        </div>
                    )}
                </section>

                {/* Type selector */}
                <div className="flex gap-2">
                    {[
                        { value: 'total', label: 'All Time' },
                        { value: 'weekly', label: 'This Week' },
                        { value: 'monthly', label: 'This Month' },
                        { value: 'streak', label: 'Streaks' }
                    ].map(opt => (
                        <button key={opt.value} onClick={() => setType(opt.value)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${type === opt.value
                                ? 'bg-[#4338ca] text-white shadow'
                                : 'bg-white text-[#475569] ring-1 ring-[#e2e8f0] hover:bg-[#f8fafc]'
                                }`}>
                            {opt.label}
                        </button>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                    {/* Leaderboard */}
                    <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                        <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Top Students</h2>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e2e8f0] border-t-[#4338ca]" />
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <p className="py-8 text-center text-sm text-[#94a3b8]">No data yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {leaderboard.map((entry, idx) => {
                                    const RankIcon = idx < 3 ? RANK_ICONS[idx] : null;
                                    const rankColor = idx < 3 ? RANK_COLORS[idx] : 'text-[#94a3b8]';
                                    const isMe = entry.studentId?.toString() === user?._id?.toString();
                                    const displayValue = type === 'weekly' ? entry.weeklyPoints
                                        : type === 'monthly' ? entry.monthlyPoints
                                            : type === 'streak' ? entry.currentStreak
                                                : entry.totalPoints;
                                    return (
                                        <div key={entry.studentId || idx}
                                            className={`flex items-center justify-between rounded-2xl p-4 transition hover:-translate-y-0.5 ${isMe ? 'bg-[#ede9fe] ring-2 ring-[#4338ca]' : idx < 3 ? 'bg-[#ede9fe]' : 'bg-[#f8fafc]'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center">
                                                    {RankIcon ? (
                                                        <RankIcon className={`h-5 w-5 ${rankColor}`} />
                                                    ) : (
                                                        <span className="text-sm font-bold text-[#94a3b8]">#{entry.rank}</span>
                                                    )}
                                                </div>
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4338ca] text-sm font-bold text-white">
                                                    {(entry.studentName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-[#0f172a]">{entry.studentName || 'Student'}{isMe ? ' (You)' : ''}</p>
                                                    <p className="text-xs text-[#94a3b8]">Level {entry.level} • {entry.badgeCount} badges</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {type === 'streak' ? (
                                                    <div className="flex items-center gap-1">
                                                        <Flame className="h-4 w-4 text-[#ef4444]" />
                                                        <span className="text-lg font-bold text-[#0f172a]">{displayValue}</span>
                                                        <span className="text-xs text-[#94a3b8]">days</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-lg font-bold text-[#4338ca]">{displayValue?.toLocaleString()} XP</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Badges */}
                    <section className="space-y-6">
                        <div className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                            <h2 className="text-lg font-semibold text-[#0f172a] mb-4">🎖️ Earned Badges</h2>
                            {badgesLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#e2e8f0] border-t-[#4338ca]" />
                                </div>
                            ) : badges.earned.length === 0 ? (
                                <p className="py-6 text-center text-sm text-[#94a3b8]">No badges earned yet. Keep learning!</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {badges.earned.map((badge, i) => {
                                        const gradients = [
                                            'from-[#fef9c3] via-[#fde68a] to-[#fbbf24]',
                                            'from-[#ede9fe] via-[#c4b5fd] to-[#8b5cf6]',
                                            'from-[#cffafe] via-[#67e8f9] to-[#06b6d4]',
                                            'from-[#fce7f3] via-[#f9a8d4] to-[#ec4899]',
                                            'from-[#dcfce7] via-[#86efac] to-[#22c55e]',
                                            'from-[#fff7ed] via-[#fed7aa] to-[#f97316]'
                                        ];
                                        const gradient = gradients[i % gradients.length];
                                        const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-0', '-rotate-3'];
                                        const rotation = rotations[i % rotations.length];
                                        return (
                                            <div key={badge.badgeId}
                                                className={`group relative ${rotation} rounded-3xl bg-gradient-to-br ${gradient} p-4 text-center shadow-lg transition-all duration-300 hover:rotate-0 hover:scale-110 hover:shadow-2xl cursor-default`}>
                                                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#22c55e] text-[8px] font-bold text-white shadow-md">✓</div>
                                                <span className="block text-4xl drop-shadow-lg transition-transform duration-300 group-hover:scale-125 group-hover:drop-shadow-2xl">{badge.icon}</span>
                                                <p className="mt-2 text-sm font-extrabold text-[#0f172a] drop-shadow-sm">{badge.name}</p>
                                                <p className="mt-0.5 text-[10px] font-medium text-[#475569]">{badge.description}</p>
                                                <div className="mt-2 inline-block rounded-full bg-white/60 px-2 py-0.5 text-[9px] font-bold text-[#4338ca] backdrop-blur-sm">
                                                    {badge.category || 'milestone'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-[#e2e8f0]">
                            <h2 className="text-lg font-semibold text-[#0f172a] mb-4">🔒 Locked Badges</h2>
                            {badges.available.length === 0 ? (
                                <p className="py-4 text-center text-sm text-[#94a3b8]">You've earned all badges! 🎉</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {badges.available.map(badge => (
                                        <div key={badge.id || badge.badgeId}
                                            className="group relative rounded-3xl bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] p-4 text-center shadow-sm transition hover:shadow-md cursor-default">
                                            <span className="block text-3xl grayscale opacity-50 transition-all group-hover:grayscale-0 group-hover:opacity-80">{badge.icon}</span>
                                            <p className="mt-2 text-xs font-bold text-[#94a3b8] group-hover:text-[#64748b]">{badge.name}</p>
                                            <p className="mt-0.5 text-[10px] text-[#cbd5e1]">{badge.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentLeaderboard;
