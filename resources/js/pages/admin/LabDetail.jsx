import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import {
    ArrowLeft, Building2, Mail, Phone, MapPin, User,
    RefreshCw, PauseCircle, PlayCircle, ArrowUpDown, Calendar, CreditCard, Package, Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = [
    { value: 'basic', label: 'Basic', fee: 500 },
    { value: 'standard', label: 'Standard', fee: 1000 },
    { value: 'premium', label: 'Premium', fee: 2000 },
];

export default function LabDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [moduleList, setModuleList] = useState([]);
    const [selectedModules, setSelectedModules] = useState([]);
    const [modulesSaving, setModulesSaving] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [invoiceSaving, setInvoiceSaving] = useState(false);
    const [expiryInput, setExpiryInput] = useState('');
    const [expirySaving, setExpirySaving] = useState(false);

    // Modals
    const [renewOpen, setRenewOpen] = useState(false);
    const [renewForm, setRenewForm] = useState({ months: 1, amount: 500, start_date: '', notes: '' });
    const [saving, setSaving] = useState(false);

    const fetchTenant = () => {
        api.get(`/admin/diagnostics/${id}`)
            .then(r => {
                setTenant(r.data);
                setRenewForm(f => ({ ...f, amount: r.data.monthly_fee, start_date: '' }));
                setExpiryInput(r.data.subscription_ends_at ? r.data.subscription_ends_at.slice(0, 10) : '');
                api.get(`/admin/diagnostics/${id}/modules`)
                    .then(mr => {
                        setModuleList(mr.data);
                        setSelectedModules(mr.data.filter(m => m.subscribed).map(m => m.slug));
                    })
                    .catch(() => {});
                api.get(`/admin/diagnostics/${id}/invoices`)
                    .then(ir => setInvoices(ir.data))
                    .catch(() => {});
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchTenant(); }, [id]);

    const handleRenew = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post(`/admin/diagnostics/${id}/subscription/renew`, {
                months: renewForm.months,
                amount: renewForm.amount,
                start_date: renewForm.start_date || undefined,
                notes: renewForm.notes,
            });
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
            await api.post(`/admin/diagnostics/${id}/subscription/suspend`);
            toast.success('Tenant suspended');
            fetchTenant();
        } catch {
            toast.error('Failed to suspend');
        }
    };

    const handleActivate = async () => {
        try {
            await api.post(`/admin/diagnostics/${id}/subscription/activate`);
            toast.success('Tenant activated');
            fetchTenant();
        } catch {
            toast.error('Failed to activate');
        }
    };

    const handleModulesSave = async () => {
        setModulesSaving(true);
        try {
            await api.put(`/admin/diagnostics/${id}/modules`, { modules: selectedModules });
            toast.success('Modules updated');
            fetchTenant();
        } catch {
            toast.error('Failed to update modules');
        } finally {
            setModulesSaving(false);
        }
    };

    const toggleModule = (slug) => {
        setSelectedModules(prev =>
            prev.includes(slug) ? prev.filter(x => x !== slug) : [...prev, slug]
        );
    };

    const handlePaymentStatusChange = async (status) => {
        try {
            const res = await api.put(`/admin/diagnostics/${id}/payment-status`, { payment_status: status });
            setTenant(res.data.tenant);
            toast.success('Payment status updated');
        } catch {
            toast.error('Failed to update payment status');
        }
    };

    const handleExpiryUpdate = async () => {
        setExpirySaving(true);
        try {
            const res = await api.put(`/admin/diagnostics/${id}`, { subscription_ends_at: expiryInput || null });
            setTenant(res.data.tenant);
            setExpiryInput(res.data.tenant?.subscription_ends_at ? res.data.tenant.subscription_ends_at.slice(0, 10) : '');
            toast.success('Expiry date updated');
        } catch {
            toast.error('Failed to update expiry date');
        } finally {
            setExpirySaving(false);
        }
    };

    const handleGenerateInvoice = async () => {
        setInvoiceSaving(true);
        try {
            await api.post(`/admin/diagnostics/${id}/invoices`, {});
            toast.success('Invoice generated');
            const ir = await api.get(`/admin/diagnostics/${id}/invoices`);
            setInvoices(ir.data);
        } catch {
            toast.error('Failed to generate invoice');
        } finally {
            setInvoiceSaving(false);
        }
    };

    const handleInvoiceStatusChange = async (invoiceId, status) => {
        try {
            await api.put(`/admin/invoices/${invoiceId}`, { status });
            const ir = await api.get(`/admin/diagnostics/${id}/invoices`);
            setInvoices(ir.data);
            toast.success('Invoice updated');
        } catch {
            toast.error('Failed to update invoice');
        }
    };

    const handleDownloadInvoice = (inv) => {
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<!DOCTYPE html><html><head><title>Invoice ${inv.id}</title>
        <style>body{font-family:Arial,sans-serif;padding:40px;color:#111}h1{margin-bottom:4px}.row{display:flex;justify-content:space-between;margin:8px 0}.label{color:#666}.total{font-size:20px;font-weight:bold;margin-top:16px;border-top:1px solid #ccc;padding-top:12px}</style>
        </head><body>
        <h1>LIS Platform — Invoice</h1>
        <p class="label">Invoice ID: ${inv.id}</p>
        <p class="label">Issued: ${inv.issued_at ? new Date(inv.issued_at).toLocaleDateString() : '—'}</p>
        <p class="label">Due: ${inv.due_at ? new Date(inv.due_at).toLocaleDateString() : '—'}</p>
        <p class="label">Status: ${inv.status}</p>
        <div class="total">Amount: ৳${Number(inv.amount).toLocaleString()}</div>
        ${inv.notes ? `<p class="label" style="margin-top:12px">Notes: ${inv.notes}</p>` : ''}
        <script>window.onload=function(){window.print();}</script>
        </body></html>`);
        w.document.close();
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Spinner size="lg" className="text-blue-500" /></div>;
    }

    if (!tenant) return <p className="text-gray-500">Not found</p>;

    const infoItems = [
        { icon: Building2, label: 'Center Name', value: tenant.name },
        { icon: Mail, label: 'Email', value: tenant.email },
        { icon: Phone, label: 'Phone', value: tenant.phone || '—' },
        { icon: User, label: 'Contact Person', value: tenant.contact_person || '—' },
        { icon: MapPin, label: 'City', value: tenant.city || '—' },
    ];

    return (
        <div className="space-y-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{tenant.name}</h1>
                        <Badge label={tenant.status} variant={tenant.status} />
                    </div>
                    <p className="text-gray-500 text-sm mt-1">Lab details and subscription management</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Info Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Building2 size={18} />
                        </div>
                        <h2 className="font-semibold text-gray-900 text-lg">Center Information</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {infoItems.map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                                <div className="w-8 h-8 rounded-lg bg-white text-gray-500 flex items-center justify-center border border-gray-200 flex-shrink-0">
                                    <Icon size={15} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-gray-400 text-xs">{label}</p>
                                    <p className="text-gray-800 font-medium truncate">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {tenant.address && (
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200 mt-4">
                            <div className="w-8 h-8 rounded-lg bg-white text-gray-500 flex items-center justify-center border border-gray-200 flex-shrink-0">
                                <MapPin size={15} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-gray-400 text-xs">Address</p>
                                <p className="text-gray-800 font-medium">{tenant.address}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Subscription Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200  flex flex-col">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CreditCard size={18} />
                        </div>
                        <h2 className="font-semibold text-gray-900 text-lg">Subscription</h2>
                    </div>

                    <div className="space-y-4 text-sm flex-1">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                            <p className="text-gray-500 text-xs">Monthly Fee</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">৳{Number(tenant.monthly_fee).toLocaleString()}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-gray-400 text-xs">Payment</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <Badge label={tenant.payment_status.charAt(0).toUpperCase() + tenant.payment_status.slice(1)} variant={tenant.payment_status} />
                                    <select
                                        value={tenant.payment_status}
                                        onChange={e => handlePaymentStatusChange(e.target.value)}
                                        className="text-xs rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="overdue">Overdue</option>
                                    </select>
                                </div>
                            </div>
                            {tenant.subscription_starts_at && (
                                <div>
                                    <p className="text-gray-400 text-xs">Started</p>
                                    <p className="font-medium mt-1">{new Date(tenant.subscription_starts_at).toLocaleDateString()}</p>
                                </div>
                            )}
                            {tenant.subscription_ends_at && (
                                <div>
                                    <p className="text-gray-400 text-xs">Expires</p>
                                    <p className="font-medium text-orange-600 mt-1">{new Date(tenant.subscription_ends_at).toLocaleDateString()}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-gray-400 text-xs">Set Expiry Date</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={expiryInput}
                                        onChange={e => setExpiryInput(e.target.value)}
                                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={handleExpiryUpdate}
                                        disabled={expirySaving}
                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                                    >
                                        {expirySaving ? '...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                            {tenant.trial_ends_at && tenant.status === 'trial' && (
                                <div>
                                    <p className="text-gray-400 text-xs">Trial Ends</p>
                                    <p className="font-medium text-blue-600 mt-1">{new Date(tenant.trial_ends_at).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-4 border-t border-gray-200 mt-4">
                        <button
                            onClick={() => setRenewOpen(true)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm"
                        >
                            <RefreshCw size={14} /> Renew Subscription
                        </button>

                        {tenant.status !== 'suspended' ? (
                            <button
                                onClick={handleSuspend}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-orange-50 text-orange-700 rounded-xl text-sm font-medium hover:bg-orange-100 transition"
                            >
                                <PauseCircle size={14} /> Suspend
                            </button>
                        ) : (
                            <button
                                onClick={handleActivate}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition"
                            >
                                <PlayCircle size={14} /> Activate
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modules */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Package size={18} />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900 text-lg">Modules</h2>
                        <p className="text-xs text-gray-500">Subscribed feature modules for this lab</p>
                    </div>
                </div>

                {moduleList.length === 0 ? (
                    <p className="text-sm text-gray-400">No modules available. Create modules first.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {moduleList.map(m => {
                                const checked = selectedModules.includes(m.slug);
                                return (
                                    <label
key={m.slug}
                                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                            checked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
onChange={() => toggleModule(m.slug)}
                                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-medium text-gray-900 text-sm">{m.name}</span>
                                                <span className="text-xs font-semibold text-gray-700">৳{Number(m.price).toLocaleString()}/mo</span>
                                            </div>
                                            {m.description && (
                                                <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                                Monthly total: <span className="font-semibold text-gray-900">
                                    ৳{moduleList.filter(m => selectedModules.includes(m.slug)).reduce((s, m) => s + Number(m.price), 0).toLocaleString()}
                                </span>
                            </div>
                            <button
                                onClick={handleModulesSave}
                                disabled={modulesSaving}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                            >
                                {modulesSaving ? <Spinner size="sm" /> : null}
                                Save Modules
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CreditCard size={18} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900 text-lg">Invoices</h2>
                            <p className="text-xs text-gray-500">Generate and track monthly invoices</p>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerateInvoice}
                        disabled={invoiceSaving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                        {invoiceSaving ? <Spinner size="sm" /> : null}
                        Generate Invoice
                    </button>
                </div>

                {invoices.length === 0 ? (
                    <p className="text-sm text-gray-400">No invoices yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Issued</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Due</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Amount</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Download</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map(inv => (
                                    <tr key={inv.id} className="border-b border-gray-100">
                                        <td className="px-4 py-3 text-gray-600">{inv.issued_at ? new Date(inv.issued_at).toLocaleDateString() : '—'}</td>
                                        <td className="px-4 py-3 text-gray-600">{inv.due_at ? new Date(inv.due_at).toLocaleDateString() : '—'}</td>
                                        <td className="px-4 py-3 font-semibold text-gray-900">৳{Number(inv.amount).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={inv.status}
                                                onChange={e => handleInvoiceStatusChange(inv.id, e.target.value)}
                                                className="text-xs rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="unpaid">Unpaid</option>
                                                <option value="paid">Paid</option>
                                                <option value="overdue">Overdue</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleDownloadInvoice(inv)}
                                                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                title="Download / Print"
                                            >
                                                <Download size={14} />
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
}