import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import {
    ArrowLeft, Building2, Mail, Phone, MapPin, User,
    RefreshCw, PauseCircle, PlayCircle, ArrowUpDown, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = [
    { value: 'basic', label: 'Basic', fee: 500 },
    { value: 'standard', label: 'Standard', fee: 1000 },
    { value: 'premium', label: 'Premium', fee: 2000 },
];

export default function DiagnosticDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tenant, setTenant] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [renewOpen, setRenewOpen] = useState(false);
    const [planOpen, setPlanOpen] = useState(false);
    const [renewForm, setRenewForm] = useState({ months: 1, plan: 'basic', amount: 500, notes: '' });
    const [planForm, setPlanForm] = useState({ plan: 'basic', monthly_fee: 500 });
    const [saving, setSaving] = useState(false);

    const fetchTenant = () => {
        api.get(`/superadmin/diagnostics/${id}`)
            .then(r => {
                setTenant(r.data);
                setRenewForm(f => ({ ...f, plan: r.data.plan, amount: r.data.monthly_fee }));
                setPlanForm({ plan: r.data.plan, monthly_fee: r.data.monthly_fee });
                return api.get(`/superadmin/diagnostics/${id}/subscription/logs`);
            })
            .then(r => setLogs(r.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchTenant(); }, [id]);

    const handleRenew = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post(`/superadmin/diagnostics/${id}/subscription/renew`, renewForm);
            toast.success('Subscription renewed!');
            setRenewOpen(false);
            fetchTenant();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to renew');
        } finally {
            setSaving(false);
        }
    };

    const handleSuspend = async () => {
        try {
            await api.post(`/superadmin/diagnostics/${id}/subscription/suspend`);
            toast.success('Tenant suspended');
            fetchTenant();
        } catch {
            toast.error('Failed to suspend');
        }
    };

    const handleActivate = async () => {
        try {
            await api.post(`/superadmin/diagnostics/${id}/subscription/activate`);
            toast.success('Tenant activated');
            fetchTenant();
        } catch {
            toast.error('Failed to activate');
        }
    };

    const handlePlanChange = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post(`/superadmin/diagnostics/${id}/subscription/change-plan`, planForm);
            toast.success('Plan updated');
            setPlanOpen(false);
            fetchTenant();
        } catch {
            toast.error('Failed to update plan');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Spinner size="lg" className="text-blue-500" /></div>;
    }

    if (!tenant) return <p>Not found</p>;

    return (
        <div className="space-y-5 max-w-4xl">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
                    <p className="text-gray-500 text-sm">Diagnostic Center Details</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Info Card */}
                <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Center Information</h2>
                        <div className="flex gap-2">
                            <Badge label={tenant.status} variant={tenant.status} />
                            <Badge label={tenant.plan} variant={tenant.plan} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {[
                            { icon: Building2, label: 'Center Name', value: tenant.name },
                            { icon: Mail, label: 'Email', value: tenant.email },
                            { icon: Phone, label: 'Phone', value: tenant.phone || '—' },
                            { icon: User, label: 'Contact Person', value: tenant.contact_person || '—' },
                            { icon: MapPin, label: 'City', value: tenant.city || '—' },
                            { icon: MapPin, label: 'State', value: tenant.state || '—' },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-start gap-2.5">
                                <Icon size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-400 text-xs">{label}</p>
                                    <p className="text-gray-800 font-medium">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {tenant.address && (
                        <div className="flex items-start gap-2.5 text-sm pt-2 border-t border-gray-100">
                            <MapPin size={15} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-gray-400 text-xs">Address</p>
                                <p className="text-gray-800 font-medium">{tenant.address}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Subscription Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <h2 className="font-semibold text-gray-900">Subscription</h2>

                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-gray-400 text-xs">Monthly Fee</p>
                            <p className="text-2xl font-bold text-gray-900">৳{Number(tenant.monthly_fee).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs">Payment</p>
                            <Badge label={tenant.payment_status} variant={tenant.payment_status} />
                        </div>
                        {tenant.subscription_starts_at && (
                            <div>
                                <p className="text-gray-400 text-xs">Started</p>
                                <p className="font-medium">{new Date(tenant.subscription_starts_at).toLocaleDateString()}</p>
                            </div>
                        )}
                        {tenant.subscription_ends_at && (
                            <div>
                                <p className="text-gray-400 text-xs">Expires</p>
                                <p className="font-medium text-orange-600">{new Date(tenant.subscription_ends_at).toLocaleDateString()}</p>
                            </div>
                        )}
                        {tenant.trial_ends_at && tenant.status === 'trial' && (
                            <div>
                                <p className="text-gray-400 text-xs">Trial Ends</p>
                                <p className="font-medium text-blue-600">{new Date(tenant.trial_ends_at).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                        <button
                            onClick={() => setRenewOpen(true)}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                        >
                            <RefreshCw size={14} /> Renew Subscription
                        </button>
                        <button
                            onClick={() => setPlanOpen(true)}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition"
                        >
                            <ArrowUpDown size={14} /> Change Plan
                        </button>
                        {tenant.status !== 'suspended' ? (
                            <button
                                onClick={handleSuspend}
                                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-orange-50 text-orange-700 rounded-xl text-sm font-medium hover:bg-orange-100 transition"
                            >
                                <PauseCircle size={14} /> Suspend
                            </button>
                        ) : (
                            <button
                                onClick={handleActivate}
                                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition"
                            >
                                <PlayCircle size={14} /> Activate
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Subscription Logs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" /> Subscription History
                    </h2>
                </div>
                {logs.length === 0 ? (
                    <p className="text-center text-gray-400 py-8 text-sm">No subscription history yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Action</th>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Plan</th>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Amount</th>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Period</th>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-5 py-3 capitalize font-medium">{log.action}</td>
                                        <td className="px-5 py-3"><Badge label={log.plan} variant={log.plan} /></td>
                                        <td className="px-5 py-3 font-medium">৳{Number(log.amount).toLocaleString()}</td>
                                        <td className="px-5 py-3 text-gray-500">
                                            {new Date(log.period_start).toLocaleDateString()} – {new Date(log.period_end).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-3 text-gray-500">{log.notes || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Renew Modal */}
            <Modal open={renewOpen} onClose={() => setRenewOpen(false)} title="Renew Subscription">
                <form onSubmit={handleRenew} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                        <select
                            value={renewForm.plan}
                            onChange={e => setRenewForm(f => ({ ...f, plan: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            {PLANS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Months</label>
                        <input
                            type="number" min="1" max="12"
                            value={renewForm.months}
                            onChange={e => setRenewForm(f => ({ ...f, months: Number(e.target.value) }))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount per Month (৳)</label>
                        <input
                            type="number" min="0"
                            value={renewForm.amount}
                            onChange={e => setRenewForm(f => ({ ...f, amount: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">Total: ৳{(renewForm.amount * renewForm.months).toLocaleString()}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <input
                            value={renewForm.notes}
                            onChange={e => setRenewForm(f => ({ ...f, notes: e.target.value }))}
                            placeholder="Optional notes"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setRenewOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 text-sm">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
                            {saving ? <Spinner size="sm" /> : null}
                            Renew
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Change Plan Modal */}
            <Modal open={planOpen} onClose={() => setPlanOpen(false)} title="Change Plan">
                <form onSubmit={handlePlanChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan</label>
                        <div className="grid grid-cols-3 gap-3">
                            {PLANS.map(p => (
                                <button
                                    key={p.value} type="button"
                                    onClick={() => setPlanForm(f => ({ ...f, plan: p.value, monthly_fee: p.fee }))}
                                    className={`p-3 rounded-xl border-2 text-center transition ${planForm.plan === p.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="font-semibold text-sm">{p.label}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">৳{p.fee}/mo</div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee (৳)</label>
                        <input
                            type="number" min="0"
                            value={planForm.monthly_fee}
                            onChange={e => setPlanForm(f => ({ ...f, monthly_fee: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setPlanOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 text-sm">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
                            {saving ? <Spinner size="sm" /> : null}
                            Update Plan
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
