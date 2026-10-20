import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';

/* ── tiny canvas hook: floating glowing orb trails ── */
function useOrbCanvas(canvasRef) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let raf;
        let w, h;

        const resize = () => {
            w = canvas.width  = canvas.offsetWidth;
            h = canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // orbs
        const orbs = Array.from({ length: 18 }, (_, i) => ({
            x: Math.random() * 1000,
            y: Math.random() * 800,
            r: 2 + Math.random() * 3,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            alpha: 0.2 + Math.random() * 0.6,
            hue: 150 + Math.random() * 40, // emerald-teal range
            trail: [],
        }));

        const draw = () => {
            ctx.clearRect(0, 0, w, h);

            orbs.forEach(o => {
                o.x += o.vx;
                o.y += o.vy;
                if (o.x < 0 || o.x > w) o.vx *= -1;
                if (o.y < 0 || o.y > h) o.vy *= -1;

                o.trail.push({ x: o.x, y: o.y });
                if (o.trail.length > 22) o.trail.shift();

                // draw trail
                o.trail.forEach((pt, idx) => {
                    const progress = idx / o.trail.length;
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, o.r * progress, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${o.hue}, 80%, 60%, ${progress * o.alpha * 0.5})`;
                    ctx.fill();
                });

                // draw head glow
                const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * 5);
                grad.addColorStop(0, `hsla(${o.hue}, 90%, 65%, ${o.alpha})`);
                grad.addColorStop(1, `hsla(${o.hue}, 90%, 65%, 0)`);
                ctx.beginPath();
                ctx.arc(o.x, o.y, o.r * 5, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            });

            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, [canvasRef]);
}

export default function LabLogin() {
    const { login } = useTenant();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const canvasRef = useRef(null);
    useOrbCanvas(canvasRef);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success('Welcome back!');
            navigate('/lab/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex overflow-hidden" style={{ background: '#020f0a' }}>

            {/* ══════════════════════════════════════
                LEFT PANEL — animated illustration
            ══════════════════════════════════════ */}
            <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden">

                {/* Base gradient */}
                <div className="absolute inset-0" style={{
                    background: 'linear-gradient(135deg,#020f0a 0%,#03231a 40%,#021610 100%)'
                }} />

                {/* Canvas orb trails */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ mixBlendMode: 'screen' }}
                />

                {/* ── LIGHT BEAMS ── */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Beam 1 — sweeping from top-left */}
                    <div className="light-beam beam-1" />
                    {/* Beam 2 — sweeping from bottom-right */}
                    <div className="light-beam beam-2" />
                    {/* Beam 3 — narrow centre scan */}
                    <div className="light-beam beam-3" />
                </div>

                {/* ── ROTATING GLOW RING ── */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="spin-ring ring-lg" />
                    <div className="spin-ring ring-md" style={{ animationDirection: 'reverse', animationDuration: '12s' }} />
                    <div className="spin-ring ring-sm" style={{ animationDuration: '7s' }} />
                </div>

                {/* ── HEX GRID ── */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }}>
                    <defs>
                        <pattern id="hex-d" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
                            <polygon points="28,2 54,16 54,44 28,58 2,44 2,16" fill="none" stroke="white" strokeWidth="1"/>
                            <polygon points="28,58 54,72 54,100 28,114 2,100 2,72" fill="none" stroke="white" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hex-d)"/>
                </svg>

                {/* ── ECG / HEARTBEAT LINE ── */}
                <div className="absolute bottom-16 left-8 right-8 pointer-events-none">
                    <svg viewBox="0 0 600 60" preserveAspectRatio="none" className="w-full h-12 opacity-40">
                        <polyline
                            points="0,30 60,30 80,30 90,5 100,55 115,30 140,30 200,30 220,30 230,8 240,52 255,30 280,30 340,30 360,30 370,10 380,50 395,30 420,30 480,30 500,30 510,12 520,48 535,30 560,30 600,30"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ecg-line"
                        />
                        {/* Moving glow dot */}
                        <circle r="4" fill="#34d399" className="ecg-dot">
                            <animateMotion
                                dur="4s"
                                repeatCount="indefinite"
                                path="M0,30 L60,30 L80,30 L90,5 L100,55 L115,30 L140,30 L200,30 L220,30 L230,8 L240,52 L255,30 L280,30 L340,30 L360,30 L370,10 L380,50 L395,30 L420,30 L480,30 L500,30 L510,12 L520,48 L535,30 L560,30 L600,30"
                            />
                        </circle>
                    </svg>
                </div>

                {/* ── MOLECULE NODES ── */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.55 }}>
                    {/* connections */}
                    <line x1="15%" y1="25%" x2="28%" y2="38%" stroke="#10b981" strokeWidth="0.8" opacity="0.3"/>
                    <line x1="28%" y1="38%" x2="18%" y2="55%" stroke="#10b981" strokeWidth="0.8" opacity="0.3"/>
                    <line x1="28%" y1="38%" x2="42%" y2="32%" stroke="#10b981" strokeWidth="0.8" opacity="0.3"/>
                    <line x1="42%" y1="32%" x2="55%" y2="48%" stroke="#34d399" strokeWidth="0.8" opacity="0.3"/>
                    <line x1="80%" y1="20%" x2="72%" y2="35%" stroke="#10b981" strokeWidth="0.8" opacity="0.3"/>
                    <line x1="72%" y1="35%" x2="82%" y2="52%" stroke="#34d399" strokeWidth="0.8" opacity="0.3"/>
                    {/* nodes */}
                    {[
                        { cx:'15%', cy:'25%', r:5, c:'#10b981', d:'2s' },
                        { cx:'28%', cy:'38%', r:7, c:'#34d399', d:'3s' },
                        { cx:'18%', cy:'55%', r:4, c:'#6ee7b7', d:'2.5s' },
                        { cx:'42%', cy:'32%', r:6, c:'#10b981', d:'3.5s' },
                        { cx:'55%', cy:'48%', r:4, c:'#34d399', d:'2s' },
                        { cx:'80%', cy:'20%', r:5, c:'#10b981', d:'4s' },
                        { cx:'72%', cy:'35%', r:7, c:'#6ee7b7', d:'2.8s' },
                        { cx:'82%', cy:'52%', r:4, c:'#34d399', d:'3.2s' },
                        { cx:'65%', cy:'65%', r:5, c:'#10b981', d:'2.2s' },
                        { cx:'22%', cy:'72%', r:4, c:'#6ee7b7', d:'3.8s' },
                    ].map((n, i) => (
                        <g key={i}>
                            <circle cx={n.cx} cy={n.cy} r={n.r * 2.5} fill={n.c} opacity="0.08">
                                <animate attributeName="r" values={`${n.r*2} ${n.r*4} ${n.r*2}`} dur={n.d} repeatCount="indefinite"/>
                            </circle>
                            <circle cx={n.cx} cy={n.cy} r={n.r} fill={n.c} opacity="0.7">
                                <animate attributeName="opacity" values="0.5;1;0.5" dur={n.d} repeatCount="indefinite"/>
                            </circle>
                        </g>
                    ))}
                </svg>

                {/* ── SCANNING LINE ── */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="scan-line" />
                </div>

                {/* ── MAIN CONTENT ── */}
                <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-12">
                    <div className="w-72 h-72 mb-6 drop-shadow-2xl">
                        <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Glow filter */}
                            <defs>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="blur"/>
                                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                </filter>
                                <linearGradient id="flaskG" x1="90" y1="80" x2="190" y2="230" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#065f46" stopOpacity="0.5"/>
                                    <stop offset="100%" stopColor="#022c22" stopOpacity="0.9"/>
                                </linearGradient>
                                <radialGradient id="liquidG" cx="50%" cy="50%">
                                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.8"/>
                                    <stop offset="100%" stopColor="#059669" stopOpacity="0.4"/>
                                </radialGradient>
                            </defs>

                            {/* Lab table */}
                            <rect x="30" y="242" width="260" height="10" rx="4" fill="#064e3b" stroke="#10b981" strokeWidth="1"/>
                            <rect x="52" y="252" width="10" height="38" rx="3" fill="#065f46"/>
                            <rect x="258" y="252" width="10" height="38" rx="3" fill="#065f46"/>

                            {/* Flask body */}
                            <path d="M130 82 L130 158 L88 230 L192 230 L150 158 L150 82 Z"
                                fill="url(#flaskG)" stroke="#10b981" strokeWidth="2" filter="url(#glow)"/>
                            {/* Animated liquid level */}
                            <path d="M93 212 Q140 198 187 212 L192 230 L88 230 Z" fill="url(#liquidG)" opacity="0.7">
                                <animate attributeName="d"
                                    values="M93 212 Q140 198 187 212 L192 230 L88 230 Z;
                                            M93 207 Q140 218 187 207 L192 230 L88 230 Z;
                                            M93 212 Q140 198 187 212 L192 230 L88 230 Z"
                                    dur="3s" repeatCount="indefinite"/>
                            </path>
                            <path d="M98 203 Q140 190 182 203 L187 212 Q140 198 93 212 Z" fill="#6ee7b7" opacity="0.3"/>
                            {/* Bubbles animate */}
                            <circle cx="115" cy="210" r="5" fill="#34d399" opacity="0.7">
                                <animate attributeName="cy" values="210;195;210" dur="2.2s" repeatCount="indefinite"/>
                                <animate attributeName="opacity" values="0.7;0;0.7" dur="2.2s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="158" cy="205" r="4" fill="#6ee7b7" opacity="0.6">
                                <animate attributeName="cy" values="205;188;205" dur="1.8s" repeatCount="indefinite"/>
                                <animate attributeName="opacity" values="0.6;0;0.6" dur="1.8s" repeatCount="indefinite"/>
                            </circle>
                            <circle cx="136" cy="218" r="3" fill="#a7f3d0" opacity="0.5">
                                <animate attributeName="cy" values="218;200;218" dur="2.6s" repeatCount="indefinite"/>
                                <animate attributeName="opacity" values="0.5;0;0.5" dur="2.6s" repeatCount="indefinite"/>
                            </circle>
                            {/* Flask neck */}
                            <rect x="126" y="62" width="28" height="24" rx="3" fill="#065f46" stroke="#10b981" strokeWidth="1.5"/>
                            <rect x="120" y="54" width="40" height="12" rx="4" fill="#047857" stroke="#10b981" strokeWidth="1.5"/>

                            {/* Test tubes */}
                            {[
                                { x: 205, h: 70, fill: '#10b981', top: 190 },
                                { x: 225, h: 75, fill: '#34d399', top: 195 },
                                { x: 245, h: 67, fill: '#6ee7b7', top: 200 },
                            ].map((t, i) => (
                                <g key={i}>
                                    <rect x={t.x} y={160} width="12" height={t.h} rx="5" fill="#065f46" stroke="#10b981" strokeWidth="1.2"/>
                                    <path d={`M${t.x} ${t.top} Q${t.x+6} ${t.top+5} ${t.x+12} ${t.top} L${t.x+12} 230 Q${t.x+6} 236 ${t.x} 230 Z`}
                                        fill={t.fill} opacity="0.55">
                                        <animate attributeName="opacity" values="0.4;0.7;0.4" dur={`${1.8+i*0.4}s`} repeatCount="indefinite"/>
                                    </path>
                                </g>
                            ))}
                            <rect x="200" y="155" width="65" height="8" rx="3" fill="#047857" stroke="#10b981" strokeWidth="1"/>

                            {/* Microscope */}
                            <ellipse cx="70" cy="240" rx="22" ry="5" fill="#047857" opacity="0.8"/>
                            <rect x="63" y="197" width="14" height="44" rx="4" fill="#065f46" stroke="#10b981" strokeWidth="1.2"/>
                            <rect x="58" y="187" width="24" height="14" rx="4" fill="#047857" stroke="#10b981" strokeWidth="1.2"/>
                            <rect x="66" y="167" width="8" height="24" rx="3" fill="#065f46" stroke="#10b981" strokeWidth="1"/>
                            <ellipse cx="70" cy="164" rx="12" ry="6" fill="#047857" stroke="#10b981" strokeWidth="1.2" filter="url(#glow)"/>
                            {/* Microscope light beam */}
                            <path d="M66 170 L60 240 M74 170 L80 240" stroke="#10b981" strokeWidth="0.8" opacity="0.2"/>

                            {/* DNA helix */}
                            <g opacity="0.75" filter="url(#glow)">
                                {[0,1,2,3,4,5].map(i => (
                                    <g key={i}>
                                        <ellipse cx="28" cy={95 + i * 24} rx="11" ry="5"
                                            fill="none" stroke={i%2===0?'#10b981':'#34d399'} strokeWidth="1.5"/>
                                        <line x1="17" y1={95+i*24} x2="39" y2={95+i*24}
                                            stroke="#6ee7b7" strokeWidth="0.8" opacity="0.35"/>
                                    </g>
                                ))}
                            </g>

                            {/* Chart */}
                            <rect x="250" y="70" width="56" height="68" rx="5" fill="#064e3b" stroke="#10b981" strokeWidth="1.2"/>
                            <polyline points="256,122 264,110 272,116 280,100 288,106 298,88"
                                fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            {[82,92,102,112,122].map((y,i) => (
                                <line key={i} x1="256" y1={y} x2="298" y2={y} stroke="#065f46" strokeWidth="0.6"/>
                            ))}

                            {/* Cross */}
                            <rect x="272" y="32" width="18" height="7" rx="2" fill="#10b981" filter="url(#glow)"/>
                            <rect x="278" y="26" width="7" height="18" rx="2" fill="#10b981" filter="url(#glow)"/>
                        </svg>
                    </div>

                    <h2 className="text-3xl font-bold text-white text-center mb-3 tracking-tight">
                        Lab
                    </h2>
                    <p className="text-emerald-300/60 text-center text-sm max-w-xs leading-relaxed">
                        Laboratory management — patients, tests, reports and billing in one place.
                    </p>

                    <div className="flex flex-wrap gap-2 mt-7 justify-center">
                        {['Lab Tests', 'Patient Records', 'Reports', 'Billing'].map((f, i) => (
                            <span
                                key={f}
                                className="px-3 py-1.5 rounded-full text-xs font-medium border"
                                style={{
                                    background: 'rgba(16,185,129,0.07)',
                                    borderColor: 'rgba(16,185,129,0.2)',
                                    color: 'rgba(110,231,183,0.85)',
                                    animation: `pillGlow 2.5s ease-in-out infinite`,
                                    animationDelay: `${i * 0.4}s`,
                                }}
                            >
                                {f}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════
                RIGHT PANEL — login form
            ══════════════════════════════════════ */}
            <div className="w-full lg:w-[460px] flex flex-col justify-center px-8 sm:px-14 py-12 relative"
                style={{ background: '#030d09' }}>

                {/* Animated top accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
                    <div className="h-full accent-sweep" />
                </div>

                {/* Subtle corner glow */}
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 70%)' }} />

                {/* Logo */}
                <div className="mb-10">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg logo-glow"
                            style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7 2L7 8L3 16L17 16L13 8L13 2Z" fill="none" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                                <rect x="6" y="2" width="8" height="2" rx="1" fill="white"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-bold text-base leading-none">LIS Platform</p>
                            <p className="text-xs mt-0.5" style={{ color: '#34d399' }}>Lab</p>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                    <p className="text-sm mt-1" style={{ color: '#475569' }}>Sign in to your lab</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#cbd5e1' }}>Email Address</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#334155' }} />
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                placeholder="lab@example.com"
                                required
                                className="w-full pl-11 pr-4 py-3 rounded-xl text-white text-sm transition-all input-field"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#cbd5e1' }}>Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#334155' }} />
                            <input
                                type={showPwd ? 'text' : 'password'}
                                value={form.password}
                                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                placeholder="••••••••"
                                required
                                className="w-full pl-11 pr-12 py-3 rounded-xl text-white text-sm transition-all input-field"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd(p => !p)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                                style={{ color: '#334155' }}
                            >
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 group mt-2 btn-signin"
                        style={{
                            background: 'linear-gradient(90deg,#059669,#0d9488)',
                            boxShadow: '0 8px 28px rgba(5,150,105,0.28)',
                        }}
                    >
                        {loading ? <Spinner size="sm" /> : (
                            <>
                                Sign In
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="absolute bottom-0 left-0 right-0 h-[1px]"
                    style={{ background: 'linear-gradient(90deg,transparent,rgba(16,185,129,0.15),transparent)' }} />
            </div>

            {/* ══ ALL ANIMATIONS ══ */}
            <style>{`
                /* ── light beams ── */
                .light-beam {
                    position: absolute;
                    pointer-events: none;
                    border-radius: 50%;
                }
                .beam-1 {
                    width: 3px;
                    height: 70%;
                    top: -10%;
                    left: 30%;
                    background: linear-gradient(180deg,
                        transparent 0%,
                        rgba(16,185,129,0.18) 40%,
                        rgba(52,211,153,0.35) 60%,
                        transparent 100%);
                    filter: blur(4px);
                    transform-origin: top center;
                    animation: beamSweep1 8s ease-in-out infinite;
                }
                .beam-2 {
                    width: 2px;
                    height: 60%;
                    bottom: -10%;
                    right: 25%;
                    background: linear-gradient(0deg,
                        transparent 0%,
                        rgba(20,184,166,0.15) 40%,
                        rgba(16,185,129,0.30) 65%,
                        transparent 100%);
                    filter: blur(3px);
                    transform-origin: bottom center;
                    animation: beamSweep2 10s ease-in-out infinite;
                    animation-delay: 3s;
                }
                .beam-3 {
                    width: 1px;
                    height: 100%;
                    top: 0;
                    left: 55%;
                    background: linear-gradient(180deg,
                        transparent 0%,
                        rgba(110,231,183,0.08) 30%,
                        rgba(110,231,183,0.18) 50%,
                        rgba(110,231,183,0.08) 70%,
                        transparent 100%);
                    filter: blur(2px);
                    animation: beamSweep3 14s linear infinite;
                    animation-delay: 1.5s;
                }

                @keyframes beamSweep1 {
                    0%,100% { transform: rotate(-20deg) translateX(0px); opacity: 0.6; }
                    50%     { transform: rotate(20deg)  translateX(60px); opacity: 1; }
                }
                @keyframes beamSweep2 {
                    0%,100% { transform: rotate(15deg) translateX(0px); opacity: 0.4; }
                    50%     { transform: rotate(-15deg) translateX(-50px); opacity: 0.9; }
                }
                @keyframes beamSweep3 {
                    0%   { transform: translateX(-200px); opacity: 0; }
                    20%  { opacity: 1; }
                    80%  { opacity: 1; }
                    100% { transform: translateX(200px); opacity: 0; }
                }

                /* ── spinning glow rings ── */
                .spin-ring {
                    position: absolute;
                    border-radius: 50%;
                    border: 1px solid transparent;
                    animation: spinRing 10s linear infinite;
                }
                .ring-lg {
                    width: 420px; height: 420px;
                    top: -210px; left: -210px;
                    border-color: rgba(16,185,129,0.08);
                    box-shadow: 0 0 30px rgba(16,185,129,0.04) inset;
                }
                .ring-md {
                    width: 290px; height: 290px;
                    top: -145px; left: -145px;
                    border-color: rgba(52,211,153,0.10);
                }
                .ring-sm {
                    width: 170px; height: 170px;
                    top: -85px; left: -85px;
                    border-color: rgba(110,231,183,0.14);
                }
                @keyframes spinRing {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }

                /* ── scan line ── */
                .scan-line {
                    position: absolute;
                    left: 0; right: 0;
                    height: 2px;
                    background: linear-gradient(90deg,
                        transparent 0%,
                        rgba(16,185,129,0.0) 10%,
                        rgba(16,185,129,0.5) 50%,
                        rgba(16,185,129,0.0) 90%,
                        transparent 100%);
                    filter: blur(1px);
                    animation: scanMove 6s ease-in-out infinite;
                    box-shadow: 0 0 8px rgba(16,185,129,0.3);
                }
                @keyframes scanMove {
                    0%   { top: -2px; opacity: 0; }
                    5%   { opacity: 1; }
                    95%  { opacity: 0.7; }
                    100% { top: 100%; opacity: 0; }
                }

                /* ── ECG line draw ── */
                .ecg-line {
                    stroke-dasharray: 800;
                    stroke-dashoffset: 800;
                    animation: ecgDraw 4s linear infinite;
                }
                @keyframes ecgDraw {
                    0%   { stroke-dashoffset: 800; opacity: 1; }
                    70%  { stroke-dashoffset: 0;   opacity: 1; }
                    100% { stroke-dashoffset: 0;   opacity: 0; }
                }

                /* ── pill glow ── */
                @keyframes pillGlow {
                    0%,100% { box-shadow: none; border-color: rgba(16,185,129,0.2); }
                    50%     { box-shadow: 0 0 10px rgba(16,185,129,0.25); border-color: rgba(16,185,129,0.5); }
                }

                /* ── input focus glow ── */
                .input-field::placeholder { color: #1e3a2f; }
                .input-field:focus {
                    outline: none;
                    border-color: rgba(16,185,129,0.4) !important;
                    box-shadow: 0 0 0 3px rgba(16,185,129,0.10), 0 0 20px rgba(16,185,129,0.08);
                    background: rgba(16,185,129,0.04) !important;
                }

                /* ── button hover ── */
                .btn-signin:hover:not(:disabled) {
                    box-shadow: 0 8px 32px rgba(5,150,105,0.45) !important;
                    transform: translateY(-1px);
                }

                /* ── logo glow pulse ── */
                .logo-glow {
                    animation: logoGlow 3s ease-in-out infinite;
                }
                @keyframes logoGlow {
                    0%,100% { box-shadow: 0 8px 20px rgba(5,150,105,0.25); }
                    50%     { box-shadow: 0 8px 30px rgba(5,150,105,0.55); }
                }

                /* ── top accent sweep ── */
                .accent-sweep {
                    width: 200%;
                    background: linear-gradient(90deg,
                        transparent 0%,
                        rgba(16,185,129,0.8) 40%,
                        rgba(52,211,153,1) 50%,
                        rgba(16,185,129,0.8) 60%,
                        transparent 100%);
                    animation: accentMove 4s ease-in-out infinite;
                }
                @keyframes accentMove {
                    0%   { transform: translateX(-100%); }
                    100% { transform: translateX(50%); }
                }
            `}</style>
        </div>
    );
}
