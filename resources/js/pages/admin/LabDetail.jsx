import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import {
    ArrowLeft, Building2, Mail, Phone, MapPin, User,
    RefreshCw, PauseCircle, PlayCircle, ArrowUpDown, Calendar, CreditCard, Package, Download, Eye
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
    const [expiryInput, setExpiryInput] = useState('');
    const [expirySaving, setExpirySaving] = useState(false);
    const [statusSaving, setStatusSaving] = useState(false);
    const [viewInvoice, setViewInvoice] = useState(null);

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
            toast.success('Subscription renewed and invoice generated!');
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

    const handleStatusChange = async (status) => {
        setStatusSaving(true);
        try {
            const res = await api.put(`/admin/diagnostics/${id}`, { status });
            setTenant(res.data.tenant);
            toast.success('Status updated');
        } catch {
            toast.error('Failed to update status');
        } finally {
            setStatusSaving(false);
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
        const lineItems = moduleList.filter(m => m.subscribed);
        const fmtDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');
        const amount = Number(inv.amount);

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Invoice ${inv.id.slice(0, 13).toUpperCase()} — LIS Platform</title>
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f1f5f9; color: #0f172a; padding: 32px 16px; }
    .sheet { max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12); }
    .head { background: #0f172a; color: #ffffff; padding: 28px 32px; display: flex; justify-content: space-between; align-items: flex-start; }
    .eyebrow { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #94a3b8; }
    .brand { font-size: 20px; font-weight: 700; margin-top: 4px; }
    .head-right { text-align: right; }
    .invoice-id { font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #e2e8f0; }
    .body { padding: 28px 32px; }
    .meta { display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
    .meta h3 { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: #94a3b8; font-weight: 600; margin-bottom: 6px; }
    .meta .name { font-size: 15px; font-weight: 700; }
    .meta .muted { font-size: 13px; color: #64748b; margin-top: 2px; }
    .rows { margin-top: 4px; }
    .row { display: flex; justify-content: space-between; gap: 16px; font-size: 14px; padding: 4px 0; }
    .row span:first-child { color: #64748b; }
    .row span:last-child { font-weight: 600; }
    .row .due { color: #ea580c; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
    th { background: #f8fafc; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #475569; text-align: left; padding: 10px 14px; }
    td { padding: 12px 14px; font-size: 14px; border-top: 1px solid #f1f5f9; }
    td.num, th.num { text-align: right; }
    tr.total td { border-top: 2px solid #0f172a; font-size: 17px; font-weight: 700; }
    .notes { margin-top: 20px; font-size: 13px; color: #64748b; }
    .foot { margin-top: 26px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
    .status { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; font-weight: 700; color: #64748b; }
    .print-btn { background: #2563eb; color: #fff; border: 0; border-radius: 10px; padding: 10px 18px; font-size: 14px; font-weight: 600; cursor: pointer; }

    @page { size: A4 portrait; margin: 12mm; }

    @media print {
        html, body { background: #ffffff !important; padding: 0 !important; margin: 0 !important; width: 100%; }
        .sheet { box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; width: 100%; overflow: visible; }
        .head { padding: 18px 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .body { padding: 18px 20px; }
        .print-btn { display: none !important; }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        tr, .row, .meta > div { page-break-inside: avoid; break-inside: avoid; }
        table { page-break-inside: auto; border-radius: 0; }
        th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .foot { margin-top: 16px; }
    }
</style>
</head>
<body>
<div class="sheet">
    <div class="head">
        <div>
            <p class="eyebrow">Invoice</p>
            <p class="brand">LIS Platform</p>
        </div>
        <div class="head-right">
            <p class="eyebrow">Invoice ID</p>
            <p class="invoice-id">${inv.id.slice(0, 13).toUpperCase()}</p>
        </div>
    </div>

    <div class="body">
        <div class="meta">
            <div>
                <h3>Billed To</h3>
                <p class="name">${tenant?.name || '—'}</p>
                <p class="muted">${tenant?.email || ''}</p>
                ${tenant?.address ? `<p class="muted">${tenant.address}</p>` : ''}
                ${tenant?.city ? `<p class="muted">${tenant.city}</p>` : ''}
            </div>
            <div class="rows">
                <div class="row"><span>Issued</span><span>${fmtDate(inv.issued_at)}</span></div>
                <div class="row"><span>Due</span><span class="due">${fmtDate(inv.due_at)}</span></div>
                <div class="row"><span>Status</span><span>${String(inv.status || '').toUpperCase()}</span></div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="num">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${lineItems.length > 0
                    ? lineItems.map(m => `<tr><td>${m.name}</td><td class="num">৳${Number(m.price).toLocaleString()}</td></tr>`).join('')
                    : `<tr><td>Subscription</td><td class="num">৳${amount.toLocaleString()}</td></tr>`}
                <tr class="total"><td>Total Due</td><td class="num">৳${amount.toLocaleString()}</td></tr>
            </tbody>
        </table>

        ${inv.notes ? `<p class="notes">Notes: ${inv.notes}</p>` : ''}

        <div class="foot">
            <span class="status">${String(inv.status || '').toUpperCase()}</span>
            <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        </div>
    </div>
</div>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');

        if (!win) {
            URL.revokeObjectURL(url);
            toast.error('Please allow pop-ups to open the invoice.');
            return;
        }

        win.addEventListener('load', () => {
            URL.revokeObjectURL(url);
            win.focus();
        });
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
        { icon: MapPin, label: 'Address', value: tenant.address || '—' },
    ];

    return (
        <div className="space-y-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-start gap-3 sm:gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition flex-shrink-0"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight break-words">{tenant.name}</h1>
                        <Badge
                            label={tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                            variant={tenant.status}
                        />
                        <select
                            value={tenant.status}
                            onChange={e => handleStatusChange(e.target.value)}
                            disabled={statusSaving}
                            className="text-xs font-medium rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                        >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="trial">Trial</option>
                            <option value="suspended">Suspended</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">Lab details and subscription management</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Info Card */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Building2 size={17} />
                        </div>
                        <h2 className="font-semibold text-gray-900">Center Information</h2>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 auto-rows-fr">
                            {infoItems.map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 h-full">
                                    <div className="w-9 h-9 rounded-lg bg-white text-gray-500 flex items-center justify-center border border-gray-200 flex-shrink-0">
                                        <Icon size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-gray-400 text-xs">{label}</p>
                                        <p className="text-gray-800 font-medium break-words">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Subscription Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CreditCard size={17} />
                        </div>
                        <h2 className="font-semibold text-gray-900">Subscription</h2>
                    </div>

                    <div className="p-6 space-y-5 flex-1">
                        {/* Monthly fee */}
                        <div className="rounded-xl bg-slate-900 dark:bg-slate-800 text-white px-5 py-4">
                            <p className="text-xs text-slate-400">Monthly Fee</p>
                            <p className="text-3xl font-semibold mt-1 tracking-tight">
                                ৳{Number(tenant.monthly_fee).toLocaleString()}
                            </p>
                        </div>

                        {/* Details list */}
                        <dl className="space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-gray-500">Payment Status</dt>
                                <dd className="flex items-center gap-2">
                                    <Badge
                                        label={tenant.payment_status.charAt(0).toUpperCase() + tenant.payment_status.slice(1)}
                                        variant={tenant.payment_status}
                                    />
                                    <select
                                        value={tenant.payment_status}
                                        onChange={e => handlePaymentStatusChange(e.target.value)}
                                        aria-label="Update payment status"
                                        className="text-xs rounded-lg border border-gray-200 bg-white px-2 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="overdue">Overdue</option>
                                    </select>
                                </dd>
                            </div>

                            {tenant.subscription_starts_at && (
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="text-gray-500">Period Starts</dt>
                                    <dd className="font-medium text-gray-900">
                                        {new Date(tenant.subscription_starts_at).toLocaleDateString()}
                                    </dd>
                                </div>
                            )}

                            {tenant.subscription_ends_at && (
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="text-gray-500">Period Ends</dt>
                                    <dd className="font-medium text-orange-600">
                                        {new Date(tenant.subscription_ends_at).toLocaleDateString()}
                                    </dd>
                                </div>
                            )}

                            {tenant.trial_ends_at && tenant.status === 'trial' && (
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="text-gray-500">Trial Ends</dt>
                                    <dd className="font-medium text-blue-600">
                                        {new Date(tenant.trial_ends_at).toLocaleDateString()}
                                    </dd>
                                </div>
                            )}
                        </dl>

                        {/* Expiry editor */}
                        <div className="rounded-xl border border-gray-200 p-4">
                            <label className="block text-xs font-medium text-gray-500 mb-2">
                                Expiry Date
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={expiryInput}
                                    onChange={e => setExpiryInput(e.target.value)}
                                    className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                />
                                <button
                                    onClick={handleExpiryUpdate}
                                    disabled={expirySaving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                                >
                                    {expirySaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-2">
                                Manually extend or shorten the access window.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-4 border-t border-gray-200 mt-4">
                        <button
                            onClick={() => setRenewOpen(true)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm"
                        >
                            <RefreshCw size={14} /> Subscription
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Package size={17} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">Modules</h2>
                            <p className="text-xs text-gray-500">Subscribed feature modules for this lab</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {moduleList.length === 0 ? (
                        <p className="text-sm text-gray-400">No modules available yet.</p>
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
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CreditCard size={17} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">Invoices</h2>
                            <p className="text-xs text-gray-500">Invoices are created when a subscription is made</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
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
                                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
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
                                            <div className="inline-flex items-center gap-3">
                                                <button
                                                    onClick={() => setViewInvoice(inv)}
                                                    className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-xs font-medium"
                                                    title="View invoice"
                                                >
                                                    <Eye size={14} />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadInvoice(inv)}
                                                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                    title="Download / Print"
                                                >
                                                    <Download size={14} />
                                                    Download
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                </div>
            </div>

            {/* Invoice Preview Modal */}
            <Modal open={!!viewInvoice} onClose={() => setViewInvoice(null)} title="Invoice" size="lg">
                {viewInvoice && (
                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-slate-400">Invoice</p>
                                <p className="text-lg font-semibold">LIS Platform</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Invoice ID</p>
                                <p className="text-xs font-mono">{viewInvoice.id.slice(0, 13).toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Billed To</p>
                                    <p className="font-semibold text-gray-900">{tenant?.name}</p>
                                    <p className="text-sm text-gray-500">{tenant?.email}</p>
                                    {tenant?.address && <p className="text-sm text-gray-500">{tenant.address}</p>}
                                    {tenant?.city && <p className="text-sm text-gray-500">{tenant.city}</p>}
                                </div>
                                <div className="sm:text-right space-y-1.5">
                                    <div className="flex sm:block">
                                        <p className="text-xs text-gray-400 sm:mb-0.5">Issued</p>
                                        <p className="text-sm font-medium text-gray-800 sm:text-right">
                                            {viewInvoice.issued_at ? new Date(viewInvoice.issued_at).toLocaleDateString() : '—'}
                                        </p>
                                    </div>
                                    <div className="flex sm:block">
                                        <p className="text-xs text-gray-400 sm:mb-0.5">Due</p>
                                        <p className="text-sm font-medium text-orange-600 sm:text-right">
                                            {viewInvoice.due_at ? new Date(viewInvoice.due_at).toLocaleDateString() : '—'}
                                        </p>
                                    </div>
                                    <div className="flex sm:block">
                                        <p className="text-xs text-gray-400 sm:mb-0.5">Status</p>
                                        <p className="text-sm font-medium text-gray-800 sm:text-right uppercase">
                                            {viewInvoice.status}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-200 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Description</th>
                                            <th className="text-right px-4 py-2.5 font-semibold text-gray-600">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {moduleList.filter(m => m.subscribed).length > 0
                                            ? moduleList.filter(m => m.subscribed).map(m => (
                                                <tr key={m.slug} className="border-b border-gray-100">
                                                    <td className="px-4 py-2.5 text-gray-700">{m.name}</td>
                                                    <td className="px-4 py-2.5 text-right text-gray-700">৳{Number(m.price).toLocaleString()}</td>
                                                </tr>
                                            ))
                                            : (
                                                <tr className="border-b border-gray-100">
                                                    <td className="px-4 py-2.5 text-gray-700">Subscription</td>
                                                    <td className="px-4 py-2.5 text-right text-gray-700">৳{Number(viewInvoice.amount).toLocaleString()}</td>
                                                </tr>
                                            )}
                                        <tr>
                                            <td className="px-4 py-2.5 font-semibold text-gray-900">Total Due</td>
                                            <td className="px-4 py-2.5 text-right text-lg font-bold text-gray-900">
                                                ৳{Number(viewInvoice.amount).toLocaleString()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {viewInvoice.notes && (
                                <p className="text-sm text-gray-500">Notes: {viewInvoice.notes}</p>
                            )}

                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-widest text-gray-400">
                                    {viewInvoice.status}
                                </span>
                                <button
                                    onClick={() => handleDownloadInvoice(viewInvoice)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    <Download size={15} />
                                    Download / Print
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Renew Modal */}
            <Modal open={renewOpen} onClose={() => setRenewOpen(false)} title="Subscription">
                <form onSubmit={handleRenew} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (optional)</label>
                        <input
                            type="date"
                            value={renewForm.start_date}
                            onChange={e => setRenewForm(f => ({ ...f, start_date: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition"
                        />
                        <p className="text-xs text-gray-400 mt-1">Leave blank to continue from current end date.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Months</label>
                        <input
                            type="number" min="1" max="12"
                            value={renewForm.months}
                            onChange={e => setRenewForm(f => ({ ...f, months: Number(e.target.value) }))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount per Month (৳)</label>
                        <input
                            type="number" min="0"
                            value={renewForm.amount}
                            onChange={e => setRenewForm(f => ({ ...f, amount: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Total: ৳{(renewForm.amount * renewForm.months).toLocaleString()} — an invoice will be generated.
                        </p>
                    </div>
                    {moduleList.filter(m => m.subscribed).length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subscribed Modules</label>
                            <div className="flex flex-wrap gap-2">
                                {moduleList.filter(m => m.subscribed).map(m => (
                                    <span key={m.slug} className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                        {m.name} (৳{Number(m.price).toLocaleString()})
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <input
                            value={renewForm.notes}
                            onChange={e => setRenewForm(f => ({ ...f, notes: e.target.value }))}
                            placeholder="Optional notes"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setRenewOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 text-sm transition">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-60 text-sm shadow-sm">
                            {saving ? <Spinner size="sm" /> : null}
                            Renew &amp; Generate Invoice
                        </button>
                    </div>
                </form>
            </Modal>

        </div>
    );
}