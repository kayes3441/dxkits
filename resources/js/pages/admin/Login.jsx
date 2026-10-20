import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import api from '../../api/axios';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';

export default function AdminLogin() {
    const { login } = useAdmin();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success('Welcome back!');
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        try {
            const res = await api.post('/admin/forgot-password', { email: form.email });
            toast.success(res.data?.message || 'Password reset link sent.');
            setForgotMode(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not send reset link');
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex overflow-hidden bg-[#0a0f1e]">

            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden">

                {/* Deep navy / indigo animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#0d1b4b] to-[#091233]" />

                {/* Animated orbs */}
                <div className="absolute top-[-80px] left-[-80px] w-[420px] h-[420px] rounded-full bg-blue-600/20 blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-100px] right-[-60px] w-[380px] h-[380px] rounded-full bg-indigo-500/20 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-900/30 blur-[80px] animate-pulse" style={{ animationDuration: '8s' }} />

                {/* Floating grid lines */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid-admin" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-admin)"/>
                </svg>

                {/* Floating animated particles */}
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-blue-400/30"
                        style={{
                            width: `${4 + (i % 4) * 3}px`,
                            height: `${4 + (i % 4) * 3}px`,
                            left: `${10 + (i * 7.5) % 80}%`,
                            top: `${15 + (i * 11) % 70}%`,
                            animation: `float ${3 + (i % 4)}s ease-in-out infinite`,
                            animationDelay: `${i * 0.4}s`,
                        }}
                    />
                ))}

                {/* Main content */}
                <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-12">

                    {/* Hospital Admin SVG illustration */}
                    <div className="w-80 h-80 mb-8">
                        <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Hospital building */}
                            <rect x="60" y="100" width="200" height="180" rx="4" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5"/>
                            <rect x="60" y="100" width="200" height="180" rx="4" fill="url(#buildingGrad)"/>

                            {/* Roof / top bar */}
                            <rect x="45" y="88" width="230" height="20" rx="4" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1"/>

                            {/* Cross sign on building */}
                            <rect x="144" y="108" width="32" height="10" rx="2" fill="#60a5fa"/>
                            <rect x="155" y="97" width="10" height="32" rx="2" fill="#60a5fa"/>

                            {/* Windows row 1 */}
                            {[85, 120, 195, 230].map((x, i) => (
                                <rect key={i} x={x} y="140" width="22" height="26" rx="3" fill="#93c5fd" opacity="0.7"/>
                            ))}
                            {/* Windows row 2 */}
                            {[85, 120, 195, 230].map((x, i) => (
                                <rect key={i} x={x} y="185" width="22" height="26" rx="3" fill="#93c5fd" opacity="0.5"/>
                            ))}

                            {/* Door */}
                            <rect x="141" y="230" width="38" height="50" rx="3" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1.5"/>
                            <circle cx="173" cy="257" r="3" fill="#60a5fa"/>

                            {/* Ground */}
                            <rect x="30" y="278" width="260" height="4" rx="2" fill="#1e3a8a" opacity="0.5"/>

                            {/* Ambulance / vehicle */}
                            <rect x="198" y="248" width="76" height="34" rx="6" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1.5"/>
                            <rect x="218" y="238" width="42" height="18" rx="4" fill="#2563eb" stroke="#60a5fa" strokeWidth="1"/>
                            <circle cx="214" cy="284" r="10" fill="#0f172a" stroke="#60a5fa" strokeWidth="2"/>
                            <circle cx="214" cy="284" r="5" fill="#1d4ed8"/>
                            <circle cx="260" cy="284" r="10" fill="#0f172a" stroke="#60a5fa" strokeWidth="2"/>
                            <circle cx="260" cy="284" r="5" fill="#1d4ed8"/>
                            {/* Ambulance cross */}
                            <rect x="230" y="250" width="14" height="5" rx="1" fill="#ef4444"/>
                            <rect x="235" y="245" width="5" height="14" rx="1" fill="#ef4444"/>

                            {/* Shield / admin badge floating */}
                            <g style={{ animation: 'float 3s ease-in-out infinite' }}>
                                <rect x="24" y="150" width="52" height="60" rx="26" fill="#1e40af" stroke="#60a5fa" strokeWidth="1.5" opacity="0.9"/>
                                <path d="M50 163 L50 196 M38 179 L62 179" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round"/>
                            </g>

                            {/* Monitor / dashboard icon top right */}
                            <g opacity="0.85">
                                <rect x="244" y="100" width="48" height="36" rx="4" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.2"/>
                                <rect x="248" y="104" width="40" height="24" rx="2" fill="#0f172a"/>
                                {/* Chart bars */}
                                <rect x="253" y="118" width="5" height="7" rx="1" fill="#3b82f6"/>
                                <rect x="261" y="114" width="5" height="11" rx="1" fill="#60a5fa"/>
                                <rect x="269" y="116" width="5" height="9" rx="1" fill="#93c5fd"/>
                                <rect x="277" y="112" width="5" height="13" rx="1" fill="#3b82f6"/>
                                {/* Stand */}
                                <rect x="264" y="136" width="4" height="6" rx="1" fill="#1d4ed8"/>
                                <rect x="258" y="141" width="16" height="3" rx="1.5" fill="#1d4ed8"/>
                            </g>

                            <defs>
                                <linearGradient id="buildingGrad" x1="60" y1="100" x2="260" y2="280" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.6"/>
                                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <h2 className="text-3xl font-bold text-white text-center mb-3">
                        Admin Portal
                    </h2>
                    <p className="text-blue-300/80 text-center text-sm max-w-xs leading-relaxed">
                        Manage all labs, subscriptions, and platform settings from one powerful dashboard.
                    </p>

                    {/* Stats pills */}
                    <div className="flex gap-4 mt-8">
                        {[
                            { label: 'Labs', value: '∞' },
                            { label: 'Control', value: '100%' },
                            { label: 'Uptime', value: '24/7' },
                        ].map(s => (
                            <div key={s.label} className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-center">
                                <div className="text-white font-bold text-lg">{s.value}</div>
                                <div className="text-blue-300/70 text-xs">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL — LOGIN FORM ── */}
            <div className="w-full lg:w-[460px] flex flex-col justify-center px-8 sm:px-14 py-12 bg-[#0d1117] relative">

                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

                {/* Logo */}
                <div className="mb-10">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <rect x="8" y="2" width="4" height="16" rx="2" fill="white"/>
                                <rect x="2" y="8" width="16" height="4" rx="2" fill="white"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-bold text-base leading-none">LIS Platform</p>
                            <p className="text-blue-400 text-xs mt-0.5">Administration</p>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        {forgotMode ? 'Forgot password?' : 'Welcome back'}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {forgotMode
                            ? 'Enter your email and we will send you a reset link'
                            : 'Sign in to your admin account'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={forgotMode ? handleForgotSubmit : handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                placeholder="superadmin@lis.com"
                                required
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition text-sm"
                            />
                        </div>
                    </div>

                    {!forgotMode && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-slate-300">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setForgotMode(true)}
                                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd(p => !p)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                                >
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={forgotMode ? forgotLoading : loading}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 group mt-2"
                    >
                        {forgotMode ? (
                            forgotLoading ? (
                                <Spinner size="sm" />
                            ) : (
                                <>
                                    Send Reset Link
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )
                        ) : loading ? (
                            <Spinner size="sm" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    {forgotMode && (
                        <button
                            type="button"
                            onClick={() => setForgotMode(false)}
                            className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
                        >
                            <ArrowLeft size={14} />
                            Back to sign in
                        </button>
                    )}
                </form>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Keyframe animation */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); opacity: 0.5; }
                    50% { transform: translateY(-12px); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
