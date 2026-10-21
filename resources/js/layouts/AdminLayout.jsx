import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import {
    LayoutDashboard, Building2, CreditCard,
    LogOut, Shield, Menu, X, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/labs', label: 'Labs', icon: Building2 },
    { to: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
];

export default function AdminLayout() {
    const { admin, logout } = useAdmin();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out');
        navigate('/admin/login');
    };

    const Sidebar = ({ mobile = false }) => (
        <aside className={`${mobile ? 'flex' : 'hidden lg:flex'} flex-col w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white h-full`}>
            {/* Brand */}
            <div className="px-6 py-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                        <Shield size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">LIS Platform</p>
                        <p className="text-xs text-slate-400">Admin</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                                isActive
                                    ? 'bg-white/15 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                            }`
                        }
                    >
                        <Icon size={18} />
                        <span className="flex-1">{label}</span>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
                    </NavLink>
                ))}
            </nav>

            {/* User */}
            <div className="px-3 py-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                        {admin?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{admin?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{admin?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    );

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-64 z-50">
                        <Sidebar mobile />
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <Sidebar />

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar */}
                <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 flex-shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex-1" />
                    <ThemeToggle />
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="hidden sm:block">{admin?.name}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            Admin
                        </span>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
