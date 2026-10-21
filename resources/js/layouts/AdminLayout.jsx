import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import {
    LayoutDashboard, Building2, CreditCard,
    LogOut, Shield, Menu, X, ChevronLeft, ChevronRight
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
    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem('admin-sidebar-collapsed') === '1'; } catch { return false; }
    });

    useEffect(() => {
        try { localStorage.setItem('admin-sidebar-collapsed', collapsed ? '1' : '0'); } catch {}
    }, [collapsed]);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out');
        navigate('/admin/login');
    };

    const Sidebar = ({ mobile = false }) => {
        const isCollapsed = collapsed && !mobile;
        return (
            <aside className={`${mobile ? 'flex' : 'hidden lg:flex'} flex-col ${isCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-slate-200 h-full border-r border-slate-800 transition-[width] duration-200`}>
                {/* Brand + collapse */}
                <div className={`px-3 py-4 border-b border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <Shield size={18} className="text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-sm text-white tracking-tight truncate">LIS Platform</p>
                                <p className="text-xs text-slate-400">Admin</p>
                            </div>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Shield size={18} className="text-white" />
                        </div>
                    )}

                </div>

                {/* Nav */}
                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                    {!isCollapsed && (
                        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Menu</p>
                    )}
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setSidebarOpen(false)}
                            title={isCollapsed ? label : undefined}
                            className={({ isActive }) =>
                                `flex items-center gap-3 ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-white/10 text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            <Icon size={18} className="flex-shrink-0" />
                            {!isCollapsed && <span className="truncate">{label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div className="px-2 py-4 border-t border-slate-800">
                    <button
                        onClick={() => navigate('/admin/profile')}
                        title={isCollapsed ? (admin?.name || 'Profile') : undefined}
                        className={`w-full flex items-center gap-3 ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2 mb-1 rounded-lg hover:bg-white/5 transition-colors text-left`}
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{admin?.name || 'Admin'}</p>
                                <p className="text-xs text-slate-400 truncate">{admin?.email}</p>
                            </div>
                        )}
                    </button>
                    <button
                        onClick={handleLogout}
                        title={isCollapsed ? 'Sign out' : undefined}
                        className={`w-full flex items-center gap-3 ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors`}
                    >
                        <LogOut size={17} className="flex-shrink-0" />
                        {!isCollapsed && <span>Sign out</span>}
                    </button>
                </div>
            </aside>
        );
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-slate-900/50" onClick={() => setSidebarOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-64 z-50">
                        <Sidebar mobile />
                    </div>
                </div>
            )}

            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-gray-600"
                    >
                        <Menu size={18} />
                    </button>
                    <button
                        onClick={() => setCollapsed(c => !c)}
                        className="hidden lg:inline-flex p-2 rounded-md hover:bg-gray-100 text-gray-600"
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                    <div className="flex-1" />
                    <ThemeToggle />
                </header>

                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}