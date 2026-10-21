import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import { User, Mail, Lock, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProfile() {
    const { admin, setAdmin } = useAdmin();
    const [form, setForm] = useState({
        name: admin?.name || '',
        email: admin?.email || '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                email: form.email,
            };
            if (form.password) {
                payload.current_password = form.current_password;
                payload.password = form.password;
                payload.password_confirmation = form.password_confirmation;
            }
            const res = await api.put('/admin/profile', payload);
            setAdmin(res.data.user);
            toast.success(res.data.message || 'Profile updated');
            setForm(f => ({ ...f, current_password: '', password: '', password_confirmation: '' }));
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors).flat().forEach(msg => toast.error(msg));
            } else {
                toast.error(err.response?.data?.message || 'Update failed');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <p className="text-sm font-medium text-blue-600 flex items-center gap-1.5">
                    <User size={14} /> Account
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">Profile</h1>
                <p className="text-gray-500 mt-1.5">Manage your admin account details and password.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-4 pb-5 border-b border-gray-200">
                    <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-lg font-semibold">
                        {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{admin?.name}</p>
                        <p className="text-sm text-gray-500">{admin?.email}</p>
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">{admin?.role}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={form.name}
                                onChange={handleChange('name')}
                                required
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={form.email}
                                onChange={handleChange('email')}
                                required
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <ShieldCheck size={16} className="text-gray-400" /> Change Password
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">Leave blank to keep your current password.</p>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={form.current_password}
                                    onChange={handleChange('current_password')}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={handleChange('password')}
                                        minLength={8}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        value={form.password_confirmation}
                                        onChange={handleChange('password_confirmation')}
                                        minLength={8}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                        {saving ? <Spinner size="sm" /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}