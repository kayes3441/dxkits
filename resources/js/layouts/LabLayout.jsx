import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import {
    LayoutDashboard, FlaskConical, LogOut, Menu, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../components/ui/Badge';

const navItems = [
    { to: '/lab/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // More items will be added as lab features are implemented
];

export default function LabLayout() {
    const { tenant, logout } = useTenant();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out');
        navigate('/lab/login');
    };

    const Sidebar = ({ mobile = false }) => (
        <aside className={`${mobile ? 'flex' : 'hidden lg:flex'} flex-col w-64 bg-gradient-to-b from-teal-900 to-teal-800 text-white h-full`}>
            <div className="px-6 py-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                        <FlaskConical size={18} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{tenant?.name}</p>
                        <div className="mt-0.5">
                            <Badge label={tenant?.plan} variant={tenant?.plan} />
                        </div>
                    </div>
                </div>
            </div>

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
                                    : 'text-teal-300 hover:text-white hover:bg-white/10'
                            }`
                        }
                    >
                        <Icon size={18} />
                        <span className="flex-1">{label}</span>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
                    </NavLink>
                ))}
            </nav>

            <div className="px-3 py-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                        {tenant?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tenant?.name}</p>
                        <Badge label={tenant?.status} variant={tenant?.status} />
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-teal-300 hover:text-white hover:bg-white/10 transition"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    );

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-64 z-50">
                        <Sidebar mobile />
                    </div>
                </div>
            )}

            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 flex-shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                        <Badge label={tenant?.status} variant={tenant?.status} />
                        {tenant?.subscription_ends_at && (
                            <span className="text-xs text-gray-500 hidden sm:block">
                                Expires: {new Date(tenant.subscription_ends_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
