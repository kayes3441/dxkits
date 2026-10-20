import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { ExternalLink, AlertTriangle, Clock } from 'lucide-react';

export default function Subscriptions() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/superadmin/diagnostics', { params: { status: 'all', page: 1 } })
            .then(r => setTenants(r.data.data))
            .finally(() => setLoading(false));
    }, []);

    const expiringSoon = tenants.filter(t => {
        if (!t.subscription_ends_at) return false;
        const daysLeft = Math.ceil((new Date(t.subscription_ends_at) - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 7 && daysLeft >= 0;
    });

    if (loading) {
        return <div className="flex justify-center py-20"><Spinner size="lg" className="text-blue-500" /></div>;
    }

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
                <p className="text-gray-500 text-sm mt-0.5">Overview of all subscriptions</p>
            </div>

            {/* Expiring soon alert */}
            {expiringSoon.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-orange-800">Subscriptions expiring soon</p>
                        <ul className="mt-2 space-y-1">
                            {expiringSoon.map(t => {
                                const daysLeft = Math.ceil((new Date(t.subscription_ends_at) - new Date()) / (1000 * 60 * 60 * 24));
                                return (
                                    <li key={t.id} className="text-sm text-orange-700 flex items-center gap-2">
                                        <Clock size={13} />
                                        <span className="font-medium">{t.name}</span> — {daysLeft === 0 ? 'expires today' : `${daysLeft} day(s) left`}
                                        <Link to={`/superadmin/diagnostics/${t.id}`} className="text-orange-600 hover:text-orange-900">
                                            <ExternalLink size={12} />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}

            {/* All subscriptions table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">All Subscriptions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Center</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Plan</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Fee/Month</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Expires</th>
                                <th className="text-left px-5 py-3 font-semibold text-gray-600">Payment</th>
                                <th className="text-right px-5 py-3 font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.map(t => {
                                const daysLeft = t.subscription_ends_at
                                    ? Math.ceil((new Date(t.subscription_ends_at) - new Date()) / (1000 * 60 * 60 * 24))
                                    : null;
                                return (
                                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                        <td className="px-5 py-4">
                                            <div className="font-medium text-gray-900">{t.name}</div>
                                            <div className="text-gray-400 text-xs">{t.email}</div>
                                        </td>
                                        <td className="px-5 py-4"><Badge label={t.plan} variant={t.plan} /></td>
                                        <td className="px-5 py-4"><Badge label={t.status} variant={t.status} /></td>
                                        <td className="px-5 py-4 font-medium">৳{Number(t.monthly_fee).toLocaleString()}</td>
                                        <td className="px-5 py-4">
                                            {t.subscription_ends_at ? (
                                                <span className={daysLeft !== null && daysLeft <= 7 ? 'text-orange-600 font-medium' : 'text-gray-600'}>
                                                    {new Date(t.subscription_ends_at).toLocaleDateString()}
                                                    {daysLeft !== null && daysLeft <= 7 && ` (${daysLeft}d)`}
                                                </span>
                                            ) : t.trial_ends_at ? (
                                                <span className="text-blue-600">Trial: {new Date(t.trial_ends_at).toLocaleDateString()}</span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-5 py-4"><Badge label={t.payment_status} variant={t.payment_status} /></td>
                                        <td className="px-5 py-4 text-right">
                                            <Link
                                                to={`/superadmin/diagnostics/${t.id}`}
                                                className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center justify-end gap-1"
                                            >
                                                Manage <ExternalLink size={12} />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
