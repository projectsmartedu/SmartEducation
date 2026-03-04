import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { gamificationAPI } from '../services/api';
import { Flame, Trophy, BookOpen, RotateCcw, Star, Award, Calendar, Rocket, Sparkles, Gem, Target, GraduationCap, Zap, Crown } from 'lucide-react';

const BADGE_ICON_MAP = {
    sword: Rocket,
    medal: Award,
    crown: Crown,
    flame: Flame,
    biceps: Target,
    star: Star,
    sparkles: Sparkles,
    gem: Gem,
    trophy: Trophy,
    rocket: Rocket,
    book: BookOpen,
    graduation: GraduationCap,
    bolt: Zap,
    brain: Sparkles
};

// ─── Activity Heatmap Component (GitHub/LeetCode style) ────────
const ActivityHeatmap = ({ data }) => {
    const [hoveredDay, setHoveredDay] = useState(null);

    // Organize data into weeks (columns) starting from Sunday
    const { weeks, months, maxPoints } = useMemo(() => {
        if (!data || data.length === 0) return { weeks: [], months: [], maxPoints: 0 };

        let mx = 0;
        data.forEach(d => { if (d.points > mx) mx = d.points; });

        // Pad start to align to Sunday
        const firstDate = new Date(data[0].date + 'T00:00:00');
        const startDay = firstDate.getDay(); // 0=Sun
        const padded = [];
        for (let i = 0; i < startDay; i++) {
            padded.push({ date: '', points: -1 }); // empty placeholder
        }
        padded.push(...data);

        // Split into weeks of 7
        const wks = [];
        for (let i = 0; i < padded.length; i += 7) {
            wks.push(padded.slice(i, i + 7));
        }

        // Calculate month labels
        const mos = [];
        let lastMonth = -1;
        wks.forEach((week, weekIdx) => {
            const validDay = week.find(d => d.date);
            if (validDay) {
                const m = new Date(validDay.date + 'T00:00:00').getMonth();
                if (m !== lastMonth) {
                    mos.push({ month: m, weekIdx });
                    lastMonth = m;
                }
            }
        });

        return { weeks: wks, months: mos, maxPoints: mx };
    }, [data]);

    const getColor = (points) => {
        if (points < 0) return 'transparent';
        if (points === 0) return '#ebedf0';
        const ratio = maxPoints > 0 ? points / maxPoints : 0;
        if (ratio <= 0.25) return '#9be9a8';
        if (ratio <= 0.5) return '#40c463';
        if (ratio <= 0.75) return '#30a14e';
        return '#216e39';
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

    return (
        <div className="relative">
            {/* Tooltip */}
            {hoveredDay && hoveredDay.date && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 rounded-lg bg-[#0f172a] px-3 py-1.5 text-xs text-white shadow-lg whitespace-nowrap pointer-events-none"
                    style={{ left: hoveredDay.x, top: hoveredDay.y - 40 }}>
                    <strong>{hoveredDay.points} XP</strong> on {new Date(hoveredDay.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            )}

            <div className="overflow-x-auto">
                <div className="inline-flex flex-col gap-0.5" style={{ minWidth: 'max-content' }}>
                    {/* Month labels */}
                    <div className="flex ml-8 mb-1">
                        {months.map((m, i) => (
                            <div key={i} className="text-xs text-[#64748b]"
                                style={{ position: 'relative', left: m.weekIdx * 15 - (i > 0 ? months[i - 1].weekIdx * 15 + (monthNames[months[i - 1].month].length * 6) : 0) }}>
                            </div>
                        ))}
                        {/* Simpler month labels */}
                        <div className="flex" style={{ gap: 0 }}>
                            {months.map((m, i) => (
                                <span key={i} className="text-[10px] text-[#64748b] font-medium"
                                    style={{ width: i < months.length - 1 ? `${(months[i + 1].weekIdx - m.weekIdx) * 15}px` : 'auto' }}>
                                    {monthNames[m.month]}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-0.5">
                        {/* Day labels */}
                        <div className="flex flex-col gap-0.5 mr-1">
                            {dayLabels.map((label, i) => (
                                <div key={i} className="h-[13px] flex items-center">
                                    <span className="text-[10px] text-[#64748b] font-medium w-6 text-right">{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Grid */}
                        {weeks.map((week, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-0.5">
                                {week.map((day, dayIdx) => (
                                    <div
                                        key={dayIdx}
                                        className="rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-[#475569]"
                                        style={{
                                            width: 13,
                                            height: 13,
                                            backgroundColor: getColor(day.points)
                                        }}
                                        onMouseEnter={(e) => day.date && setHoveredDay({ ...day, x: e.clientX, y: e.target.getBoundingClientRect().top })}
                                        onMouseLeave={() => setHoveredDay(null)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-end gap-1 mt-2 mr-1">
                        <span className="text-[10px] text-[#64748b] mr-1">Less</span>
                        {['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'].map((color, i) => (
                            <div key={i} className="rounded-sm" style={{ width: 13, height: 13, backgroundColor: color }} />
                        ))}
                        <span className="text-[10px] text-[#64748b] ml-1">More</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Profile Page ─────────────────────────────────────────
const StudentProfile = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await gamificationAPI.getActivityHeatmap();
                setData(res.data);
            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-24">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e2e8f0] border-t-[#4338ca]" />
                </div>
            </DashboardLayout>
        );
    }

    const stats = [
        { label: 'Total XP', value: data?.totalPoints?.toLocaleString() || '0', icon: Star, color: 'text-[#f59e0b]', bg: 'bg-[#fef9c3]' },
        { label: 'Level', value: data?.level || 1, icon: Trophy, color: 'text-[#4338ca]', bg: 'bg-[#ede9fe]' },
        { label: 'Current Streak', value: `${data?.currentStreak || 0}d`, icon: Flame, color: 'text-[#ef4444]', bg: 'bg-[#fee2e2]' },
        { label: 'Longest Streak', value: `${data?.longestStreak || 0}d`, icon: Flame, color: 'text-[#f97316]', bg: 'bg-[#fff7ed]' },
        { label: 'Lessons Done', value: data?.lessonsCompleted || 0, icon: BookOpen, color: 'text-[#16a34a]', bg: 'bg-[#dcfce7]' },
        { label: 'Revisions Done', value: data?.revisionsCompleted || 0, icon: RotateCcw, color: 'text-[#0ea5e9]', bg: 'bg-[#e0f2fe]' },
        { label: 'Active Days', value: data?.totalActiveDays || 0, icon: Calendar, color: 'text-[#8b5cf6]', bg: 'bg-[#f5f3ff]' },
        { label: 'Badges', value: data?.badges?.length || 0, icon: Award, color: 'text-[#ec4899]', bg: 'bg-[#fce7f3]' }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Profile Header */}
                <section className="rounded-xl border border-[#e2e8f0] bg-white p-8 shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#4338ca] text-3xl font-bold text-white shadow-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#0f172a]">{user?.name || 'Student'}</h1>
                            <p className="text-sm text-[#64748b]">{user?.email}</p>
                            <div className="mt-2 flex items-center gap-4">
                                <span className="inline-flex items-center gap-1 rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-sm font-medium text-[#334155]">
                                    <Trophy className="h-4 w-4 text-[#f59e0b]" /> Level {data?.level || 1}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-sm font-medium text-[#334155]">
                                    <Star className="h-4 w-4 text-[#f59e0b]" /> {data?.totalPoints?.toLocaleString() || 0} XP
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-sm font-medium text-[#334155]">
                                    <Flame className="h-4 w-4 text-[#ef4444]" /> {data?.currentStreak || 0} day streak
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Grid */}
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-[#64748b]">{stat.label}</p>
                                    <p className="text-lg font-bold text-[#0f172a]">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Activity Heatmap */}
                <section className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-[#0f172a]">Study Activity</h2>
                            <p className="text-sm text-[#64748b]">
                                {data?.totalActiveDays || 0} active days in the last year
                            </p>
                        </div>
                    </div>
                    <ActivityHeatmap data={data?.heatmap || []} />
                </section>

                {/* Badges Section */}
                {data?.badges && data.badges.length > 0 && (
                    <section className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-[#0f172a] mb-4">
                            Badges Earned ({data.badges.length})
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {data.badges.map((badge, i) => (
                                <div key={i} className="flex flex-col items-center rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 transition hover:bg-white">
                                    {(() => {
                                        const BadgeIcon = BADGE_ICON_MAP[badge.icon] || Trophy;
                                        return <BadgeIcon className="mb-2 h-7 w-7 text-[#334155]" />;
                                    })()}
                                    <p className="text-xs font-semibold text-[#0f172a] text-center">{badge.name}</p>
                                    <p className="text-[10px] text-[#94a3b8] text-center mt-0.5">{badge.description}</p>
                                    <p className="text-[10px] text-[#4338ca] mt-1">
                                        {new Date(badge.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentProfile;
