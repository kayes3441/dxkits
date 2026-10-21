import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import {
    Building2, CheckCircle, Clock, AlertTriangle,
    XCircle, DollarSign, TrendingUp, Activity, PieChart as PieIcon, BarChart3
} from 'lucide-react';
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const STATUS_COLORS = {
    active: '#10b981',
    trial: '#6366f1',
    suspended: '#f97316',
    expired: '#ef4444',
};

const PLAN_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [stats, setStats] = useState(null);
    const [planData, setPlanData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [statsRes] = await Promise.all([api.get('/admin/stats')]);
                if (cancelled) return;
                setStats(statsRes.data);

                // Fetch all labs for plan distribution
                const first = await api.get('/admin/diagnostics', { params: { status: 'all', page: 1 } });
                const pages = first.data.last_page || 1;
                const all = [...(first.data.data || [])];
                for (let p = 2; p <= pages; p++) {
                    const res = await api.get('/admin/diagnostics', { params: { status: 'all', page: p } });
                    all.push(...(res.data.data || []));
                }
                if (cancelled) return;

                const counts = all.reduce((acc, t) => {
                    const plan = t.plan || 'basic';
                    acc[plan] = (acc[plan] || 0) + 1;
                    return acc;
                }, {});
                const planLabels = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };
                setPlanData(
                    Object.entries(counts).map(([key, value]) => ({
                        name: planLabels[key] || key,
                        value,
                    }))
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" className="text-blue-500" />
            </div>
        );
    }

    const statusData = [
        { name: 'Active', value: stats?.active ?? 0, color: STATUS_COLORS.active },
        { name: 'On Trial', value: stats?.trial ?? 0, color: STATUS_COLORS.trial },
        { name: 'Suspended', value: stats?.suspended ?? 0, color: STATUS_COLORS.suspended },
        { name: 'Expired', value: stats?.expired ?? 0, color: STATUS_COLORS.expired },
    ].filter(d => d.value > 0);

    const axisColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#1e293b' : '#e2e8f0';
    const tooltipStyle = {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        borderRadius: '12px',
        color: isDark ? '#f8fafc' : '#0f172a',
    };

    return (
        <div className="space-y-8">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-blue-600 flex items-center gap-1.5">
                        <Activity size={14} /> Platform overview
                    </p>
                    <h1 className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 mt-1.5">Monitor all labs, subscriptions, and revenue at a glance.</p>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <StatCard label="Total Labs" value={stats?.total ?? 0} icon={Building2} color="blue" />
                <StatCard label="Active" value={stats?.active ?? 0} icon={CheckCircle} color="emerald" />
                <StatCard label="On Trial" value={stats?.trial ?? 0} icon={Clock} color="indigo" />
                <StatCard label="Suspended" value={stats?.suspended ?? 0} icon={AlertTriangle} color="orange" />
                <StatCard label="Expired" value={stats?.expired ?? 0} icon={XCircle} color="red" />
                <StatCard
                    label="This Month Revenue"
                    value={`৳${Number(stats?.this_month_revenue ?? 0).toLocaleString()}`}
                    icon={TrendingUp}
                    color="purple"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status donut */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <PieIcon size={18} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">Lab Status</h2>
                            <p className="text-xs text-gray-500">Distribution of all labs by status</p>
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={95}
                                    paddingAngle={3}
                                    stroke="none"
                                >
                                    {statusData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend
                                    verticalAlign="bottom"
                                    iconType="circle"
                                    formatter={(value) => <span style={{ color: axisColor, fontSize: 12 }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Plan bar chart */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <BarChart3 size={18} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">Plans</h2>
                            <p className="text-xs text-gray-500">Labs by subscription plan</p>
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={planData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }} />
                                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                    {planData.map((_, i) => (
                                        <Cell key={i} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Revenue summary */}
            <div className="bg-slate-900 rounded-xl p-6 sm:p-8 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                            <DollarSign size={22} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-300 font-medium">Total Revenue Collected</p>
                            <p className="text-3xl sm:text-4xl font-bold mt-1 tracking-tight">
                                ৳{Number(stats?.revenue ?? 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="text-sm text-slate-400 max-w-xs">
                        Across all subscription renewals from every registered lab on the platform.
                    </div>
                </div>
            </div>
        </div>
    );
}