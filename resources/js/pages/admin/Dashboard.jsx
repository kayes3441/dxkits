import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import {
    Building2, CheckCircle, Clock, AlertTriangle,
    XCircle, DollarSign, TrendingUp
} from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/stats')
            .then(r => setStats(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" className="text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Overview of all labs</p>
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

            {/* Revenue summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <DollarSign size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Revenue Collected</p>
                        <p className="text-2xl font-bold text-gray-900">
                            ৳{Number(stats?.revenue ?? 0).toLocaleString()}
                        </p>
                    </div>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                    Across all subscription renewals from all labs
                </p>
            </div>
        </div>
    );
}
