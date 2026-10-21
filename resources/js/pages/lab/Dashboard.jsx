import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useTenant } from '../../context/TenantContext';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import {
    Users, FlaskConical, FileText, CheckCircle,
    Calendar, AlertTriangle, Clock, Package
} from 'lucide-react';

export default function LabDashboard() {
    const { tenant } = useTenant();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/diagnostic/dashboard')
            .then(r => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="flex justify-center py-20"><Spinner size="lg" className="text-teal-500" /></div>;
    }

    const trialDaysLeft = tenant?.trial_ends_at
        ? Math.ceil((new Date(tenant.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    const subDaysLeft = tenant?.subscription_ends_at
        ? Math.ceil((new Date(tenant.subscription_ends_at) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {tenant?.name}</h1>
                <p className="text-gray-500 mt-1">Here's your lab overview</p>
            </div>

            {/* Trial / Subscription banner */}
            {tenant?.status === 'trial' && trialDaysLeft !== null && trialDaysLeft <= 7 && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-orange-800">Trial ending soon</p>
                        <p className="text-sm text-orange-700 mt-0.5">
                            Your trial expires in {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}. Contact the administrator to activate your subscription.
                        </p>
                    </div>
                </div>
            )}

            {subDaysLeft !== null && subDaysLeft <= 7 && tenant?.status === 'active' && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-orange-800">Subscription expiring soon</p>
                        <p className="text-sm text-orange-700 mt-0.5">
                            Your subscription expires in {subDaysLeft} day{subDaysLeft !== 1 ? 's' : ''}. Contact the administrator to renew.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Total Patients" value={data?.stats?.total_patients ?? 0} icon={Users} color="blue" />
                <StatCard label="Total Tests" value={data?.stats?.total_tests ?? 0} icon={FlaskConical} color="teal" />
                <StatCard label="Pending Reports" value={data?.stats?.pending_reports ?? 0} icon={Clock} color="orange" />
                <StatCard label="Completed Today" value={data?.stats?.completed_today ?? 0} icon={CheckCircle} color="emerald" />
            </div>

            {/* Account Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" /> Account Status
                    </h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-gray-500">Status</span>
                            <Badge
                                label={tenant?.status ? tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1) : '—'}
                                variant={tenant?.status}
                            />
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-gray-500">Payment</span>
                            <Badge
                                label={tenant?.payment_status ? tenant.payment_status.charAt(0).toUpperCase() + tenant.payment_status.slice(1) : '—'}
                                variant={tenant?.payment_status}
                            />
                        </div>
                        {tenant?.trial_ends_at && tenant?.status === 'trial' && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-500">Trial Ends</span>
                                <span className="font-medium text-blue-600">{new Date(tenant.trial_ends_at).toLocaleDateString()}</span>
                            </div>
                        )}
                        {tenant?.subscription_ends_at && (
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-500">Subscription Ends</span>
                                <span className="font-medium">{new Date(tenant.subscription_ends_at).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Package size={18} className="text-gray-400" /> Your Modules
                    </h2>
                    {data?.modules?.length ? (
                        <div className="space-y-2">
                            {data.modules.map(m => (
                                <div key={m.slug} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{m.name}</p>
                                        {m.description && <p className="text-xs text-gray-400">{m.description}</p>}
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">৳{Number(m.price).toLocaleString()}/mo</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No modules are active for this lab yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
