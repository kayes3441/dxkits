import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { ExternalLink, AlertTriangle, Clock, CreditCard } from 'lucide-react';

export default function Subscriptions() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/diagnostics', { params: { status: 'all', page: 1 } })
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
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <p className="text-sm font-medium text-blue-600 flex items-center gap-1.5">
                    <CreditCard size={14} /> Billing
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">Subscriptions</h1>
                <p className="text-gray-500 mt-1.5">Overview of all lab subscriptions and payments.</p>
            </div>

            {/* Expiring soon alert */}
            {expiringSoon.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm ">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-orange-900">Subscriptions expiring soon</p>
                        <p className="text-sm text-orange-700 mt-0.5">{expiringSoon.length} lab{expiringSoon.length > 1 ? 's' : ''} need attention.</p>
                        <ul className="mt-3 space-y-1.5">
                            {expiringSoon.map(t => {
                                const daysLeft = Math.ceil((new Date(t.subscription_ends_at) - new Date()) / (1000 * 60 * 60 * 24));
                                return (
                                    <li key={t.id} className="text-sm text-orange-800 flex items-center gap-2">
                                        <Clock size={13} className="text-orange-500" />
                                        <span className="font-medium">{t.name}</span>
                                        <span className="text-orange-600">— {daysLeft === 0 ? 'expires today' : `${daysLeft} day(s) left`}</span>
                                        <Link to={`/admin/labs/${t.id}`} className="ml-1 text-orange-600 hover:text-orange-900">
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-gray-900">All Subscriptions</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{tenants.length} total</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Center</th>
                                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Status</th>
                                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Fee/Month</th>
                                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Expires</th>
                                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Payment</th>
                                <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400">No subscriptions yet</td>
                                </tr>
                            ) : tenants.map(t => {
                                const daysLeft = t.subscription_ends_at
                                    ? Math.ceil((new Date(t.subscription_ends_at) - new Date()) / (1000 * 60 * 60 * 24))
                                    : null;
                                return (
                                    <tr key={t.id} className="border-b border-gray-50 hover:bg-blue-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                                                    {t.name?.charAt(0)?.toUpperCase() || 'L'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{t.name}</div>
                                                    <div className="text-gray-400 text-xs">{t.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4"><Badge label={t.status} variant={t.status} /></td>
                                        <td className="px-5 py-4 font-medium text-gray-900">৳{Number(t.monthly_fee).toLocaleString()}</td>
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
                                                to={`/admin/labs/${t.id}`}
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
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