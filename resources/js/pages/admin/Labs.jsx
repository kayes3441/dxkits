import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import {
    Plus, Search, Eye, Trash2, Building2,
    ChevronLeft, ChevronRight, Filter, Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['all', 'pending', 'active', 'trial', 'suspended', 'expired'];

const emptyForm = {
    name: '', email: '', password: '', phone: '',
    address: '', city: '', contact_person: '',
    monthly_fee: 0,
};

export default function Labs() {
    const [data, setData] = useState({ data: [], current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [createOpen, setCreateOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [allModules, setAllModules] = useState([]);
    const [selectedModules, setSelectedModules] = useState([]);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        api.get('/admin/diagnostics', { params: { search, status, page } })
            .then(r => setData(r.data))
            .finally(() => setLoading(false));
    }, [search, status, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        api.get('/admin/modules').then(r => setAllModules(r.data)).catch(() => {});
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/admin/diagnostics', { ...form, modules: selectedModules });
            toast.success('Lab created! Database provisioned.');
            setCreateOpen(false);
            setForm(emptyForm);
            setSelectedModules([]);
            fetchData();
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors).flat().forEach(msg => toast.error(msg));
            } else {
                toast.error(err.response?.data?.message || 'Creation failed');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/diagnostics/${deleteId}`);
            toast.success('Lab deleted.');
            setDeleteId(null);
            fetchData();
        } catch {
            toast.error('Delete failed.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-blue-600 flex items-center gap-1.5">
                        <Building2 size={14} /> Lab management
                    </p>
                    <h1 className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">Labs</h1>
                    <p className="text-gray-500 mt-1.5">Manage all registered diagnostic centers.</p>
                </div>
                <button
                    onClick={() => setCreateOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                    Add New Lab
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 ">
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by name, email, city..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter size={16} className="text-gray-400" />
                        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
                            {STATUS_FILTERS.map(s => (
                                <button
                                    key={s}
                                    onClick={() => { setStatus(s); setPage(1); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                                        status === s
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size="lg" className="text-blue-500" />
                    </div>
                ) : data.data.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-gray-400">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                            <Building2 size={28} className="opacity-40" />
                        </div>
                        <p className="font-medium text-gray-600">No labs found</p>
                        <p className="text-sm mt-1">Create one to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Lab</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Status</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Subscription</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Fee/Month</th>
                                    <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.data.map((t) => (
                                    <tr key={t.id} className="border-b border-gray-50 hover:bg-blue-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                                                    {t.name?.charAt(0)?.toUpperCase() || 'L'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{t.name}</div>
                                                    <div className="text-gray-400 text-xs mt-0.5">{t.email}</div>
                                                    {t.city && <div className="text-gray-400 text-xs">{t.city}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <Badge label={t.status} variant={t.status} />
                                        </td>
                                        <td className="px-5 py-4 text-gray-500">
                                            {t.subscription_ends_at
                                                ? `Ends ${new Date(t.subscription_ends_at).toLocaleDateString()}`
                                                : t.trial_ends_at
                                                ? `Trial ends ${new Date(t.trial_ends_at).toLocaleDateString()}`
                                                : '—'}
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-gray-900">
                                            ৳{Number(t.monthly_fee).toLocaleString()}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    to={`/admin/labs/${t.id}`}
                                                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteId(t.id)}
                                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {data.last_page > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
                        <p className="text-sm text-gray-500">Page {data.current_page} of {data.last_page}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 transition"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(data.last_page, p + 1))}
                                disabled={page === data.last_page}
                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 transition"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Lab" size="lg">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lab Name *</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                required
                                placeholder="e.g. City Lab"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                required
                                placeholder="center@email.com"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                required
                                placeholder="Min 8 characters"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                            <input
                                value={form.contact_person}
                                onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))}
                                placeholder="Dr. John Doe"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                value={form.phone}
                                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                placeholder="+880 1XXX-XXXXXX"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                value={form.city}
                                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                placeholder="Dhaka"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                value={form.address}
                                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                placeholder="123 Main Street"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition"
                            />
                        </div>
                    </div>

                    {/* Module selection */}
                    {allModules.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Modules</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {allModules.filter(m => m.is_active).map(m => {
                                    const checked = selectedModules.includes(m.slug);
                                    return (
                                        <label
                                            key={m.slug}
                                            className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                                                checked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => {
                                                    setSelectedModules(prev => {
                                                        const next = prev.includes(m.slug)
                                                            ? prev.filter(x => x !== m.slug)
                                                            : [...prev, m.slug];
                                                        const total = allModules
                                                            .filter(x => next.includes(x.slug))
                                                            .reduce((s, x) => s + Number(x.price), 0);
                                                        setForm(f => ({ ...f, monthly_fee: total }));
                                                        return next;
                                                    });
                                                }}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="flex-1 text-gray-800">{m.name}</span>
                                            <span className="text-xs font-medium text-gray-500">৳{Number(m.price).toLocaleString()}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee (৳)</label>
                        <input
                            type="number"
                            value={form.monthly_fee}
                            readOnly
                            min="0"
                            step="0.01"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-600 text-sm cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-calculated from selected modules.</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setCreateOpen(false)}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-blue-700 transition-colors text-sm"
                        >
                            {saving ? <Spinner size="sm" /> : null}
                            {saving ? 'Creating...' : 'Create Lab'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete confirm */}
            <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Lab" size="sm">
                <p className="text-gray-600 text-sm mb-5">
                    This will permanently delete the lab and its entire database. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => setDeleteId(null)}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition text-sm shadow-lg shadow-red-500/20"
                    >
                        Delete Forever
                    </button>
                </div>
            </Modal>
        </div>
    );
}