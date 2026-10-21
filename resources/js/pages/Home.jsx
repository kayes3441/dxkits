import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import {
    FlaskConical, ArrowRight, Users, Microscope, FileText,
    CreditCard, ShieldCheck, BarChart3, CheckCircle2, ChevronDown,
    TestTubes, CalendarClock, Boxes, ClipboardList, Send, UserCog,
    Stethoscope, Briefcase, Sparkles
} from 'lucide-react';

const features = [
    {
        icon: Users,
        title: 'Patient Records',
        description: 'Register patients, store demographics, and keep a complete visit history in one secure place.',
    },
    {
        icon: Microscope,
        title: 'Test Management',
        description: 'Maintain your test catalog, track samples, and record results without manual paperwork.',
    },
    {
        icon: TestTubes,
        title: 'Sample Tracking',
        description: 'Follow every sample from collection to result so nothing gets lost or duplicated.',
    },
    {
        icon: FileText,
        title: 'Reports & Results',
        description: 'Generate clean, ready-to-deliver reports for doctors and patients in a few clicks.',
    },
    {
        icon: CreditCard,
        title: 'Billing & Payments',
        description: 'Create invoices, record payments, and monitor dues without spreadsheets.',
    },
    {
        icon: CalendarClock,
        title: 'Scheduling',
        description: 'Organize collection times and daily workload so the team knows what is next.',
    },
    {
        icon: Boxes,
        title: 'Inventory Awareness',
        description: 'Keep an eye on the supplies and reagents your tests depend on.',
    },
    {
        icon: ShieldCheck,
        title: 'Secure Access',
        description: 'Each lab gets its own isolated workspace with role-based access for staff.',
    },
    {
        icon: BarChart3,
        title: 'Operational Insights',
        description: 'See daily activity and workload at a glance so your team can plan better.',
    },
];

const benefits = [
    'Faster report turnaround',
    'Fewer manual errors',
    'Centralized lab data',
    'Separate workspace per lab',
];

const steps = [
    {
        icon: ClipboardList,
        step: '01',
        title: 'Register',
        description: 'Add the patient, choose the required tests, and create the visit in seconds.',
    },
    {
        icon: TestTubes,
        step: '02',
        title: 'Process',
        description: 'Collect the sample, track its progress, and enter results as they become available.',
    },
    {
        icon: Send,
        step: '03',
        title: 'Deliver',
        description: 'Publish the report, record the payment, and keep everything on file for later.',
    },
];

const roles = [
    {
        icon: Briefcase,
        title: 'Lab Owners',
        description: 'Oversee operations, subscriptions, and staff activity from one dashboard.',
    },
    {
        icon: Stethoscope,
        title: 'Technicians',
        description: 'Work through the sample queue and record accurate results without clutter.',
    },
    {
        icon: UserCog,
        title: 'Front Desk',
        description: 'Handle registration, billing, and report hand-off without leaving the system.',
    },
];

const stats = [
    { value: 9, suffix: '', label: 'Core tools' },
    { value: 3, suffix: '', label: 'Step workflow' },
    { value: 1, suffix: '', label: 'Unified workspace' },
    { value: 24, suffix: '/7', label: 'Access' },
];

const capabilities = [
    'Patient Records',
    'Sample Tracking',
    'Reports & Results',
    'Billing',
    'Scheduling',
    'Inventory',
    'Role-based Access',
    'Lab Insights',
];

const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Lightweight scroll-reveal wrapper.
 * Animates opacity/transform only and disconnects after the first reveal.
 */
function Reveal({ children, delay = 0, className = '' }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }

        if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.12 }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`${className} transition-[opacity,transform] duration-700 ease-out ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

/**
 * Counts up to a target value the first time it scrolls into view.
 * Uses requestAnimationFrame only, no timers or libraries.
 */
function CountUp({ value, suffix = '' }) {
    const ref = useRef(null);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const element = ref.current;
        if (!element || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
            setCount(value);
            return;
        }

        let frame = 0;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    return;
                }

                observer.disconnect();

                const duration = 1100;
                const start = performance.now();

                const tick = (now) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setCount(Math.round(value * eased));

                    if (progress < 1) {
                        frame = requestAnimationFrame(tick);
                    }
                };

                frame = requestAnimationFrame(tick);
            },
            { threshold: 0.4 }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
            if (frame) {
                cancelAnimationFrame(frame);
            }
        };
    }, [value]);

    return (
        <span ref={ref}>
            {count}
            {suffix}
        </span>
    );
}

/**
 * Thin reading-progress bar. Passive scroll listener only.
 */
function ScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let frame = 0;

        const update = () => {
            const root = document.documentElement;
            const max = root.scrollHeight - root.clientHeight;
            setProgress(max > 0 ? (root.scrollTop / max) * 100 : 0);
        };

        const onScroll = () => {
            if (frame) {
                return;
            }

            frame = requestAnimationFrame(() => {
                frame = 0;
                update();
            });
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
            if (frame) {
                cancelAnimationFrame(frame);
            }
        };
    }, []);

    return (
        <div
            className="fixed top-0 left-0 z-50 h-[2px] bg-gradient-to-r from-emerald-400 to-teal-300"
            style={{ width: `${progress}%` }}
        />
    );
}

export default function Home() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={`${isDark ? 'home-dark' : 'home-light'} min-h-screen bg-[var(--home-bg)] text-[var(--home-heading)] relative overflow-hidden`}>
            <ScrollProgress />
            <ThemeToggle className="fixed right-4 top-4 z-50" />

            {/* Ambient glow orbs */}
            <div className="pointer-events-none absolute top-[-120px] left-[-120px] w-[420px] h-[420px] rounded-full bg-emerald-500/15 blur-[120px] animate-home-float" />
            <div className="pointer-events-none absolute top-[35%] right-[-140px] w-[460px] h-[460px] rounded-full bg-teal-500/15 blur-[130px] animate-home-float-slow" />
            <div className="pointer-events-none absolute bottom-[-180px] left-[20%] w-[520px] h-[520px] rounded-full bg-emerald-500/10 blur-[120px]" />

            {/* Grid overlay */}
            <svg className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.05] text-[var(--home-grid)]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="home-grid" width="64" height="64" patternUnits="userSpaceOnUse">
                        <path d="M 64 0 L 0 0 0 64" fill="none" stroke="currentColor" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#home-grid)" />
            </svg>

            {/* Floating particles */}
            {[...Array(14)].map((_, i) => (
                <div
                    key={i}
                    className="pointer-events-none absolute rounded-full bg-emerald-400/30 animate-home-float"
                    style={{
                        width: `${3 + (i % 4) * 2}px`,
                        height: `${3 + (i % 4) * 2}px`,
                        left: `${8 + (i * 6.5) % 85}%`,
                        top: `${10 + (i * 9) % 70}%`,
                        animationDuration: `${4 + (i % 5)}s`,
                        animationDelay: `${i * 0.35}s`,
                    }}
                />
            ))}

            {/* ── HERO ── */}
            <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center">

                <div className="relative inline-flex items-center justify-center mb-8 animate-home-rise">
                    <span className="absolute w-32 h-32 rounded-full border border-emerald-400/25 animate-home-ping" />
                    <span className="absolute w-24 h-24 rounded-full border border-emerald-400/30 animate-home-ping [animation-delay:0.7s]" />

                    {/* Orbiting dots */}
                    <div className="pointer-events-none absolute w-36 h-36 animate-home-orbit">
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-300/90 shadow-[0_0_10px_2px_rgba(52,211,153,0.5)]" />
                        <span className="absolute bottom-[10%] left-[8%] w-1.5 h-1.5 rounded-full bg-teal-300/80" />
                        <span className="absolute right-[6%] top-[38%] w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
                    </div>

                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-600/30 animate-home-glow">
                        <FlaskConical size={38} className="text-white animate-home-flask" strokeWidth={1.8} />
                    </div>
                </div>

                <h1 className="home-title text-7xl sm:text-8xl font-black tracking-tight leading-none animate-home-shimmer">
                    LIS
                </h1>

                <p className="mt-4 text-lg text-[var(--home-accent)] font-medium animate-home-fade">
                    Laboratory Information System
                </p>

                <p className="mt-4 text-sm sm:text-base text-[var(--home-body)] max-w-lg mx-auto leading-relaxed animate-home-fade [animation-delay:0.2s]">
                    A complete workspace for diagnostic labs — manage patients, tests,
                    reports, and billing securely from a single platform.
                </p>

                <div className="mt-10 animate-home-fade [animation-delay:0.35s]">
                    <Link
                        to="/lab/login"
                        className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-600/30 hover:from-emerald-400 hover:to-teal-500 hover:shadow-emerald-500/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--home-bg)]"
                    >
                        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/25 blur-md -skew-x-12 -translate-x-full group-hover:animate-home-shine" />
                        <span className="relative">Lab Login</span>
                        <ArrowRight size={18} className="relative group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <a
                    href="#about"
                    className="mt-14 inline-flex flex-col items-center gap-1 rounded text-xs text-[var(--home-accent-soft)] hover:text-[var(--home-accent)] transition animate-home-fade [animation-delay:0.5s] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
                >
                    Learn more
                    <ChevronDown size={16} className="animate-home-bounce" />
                </a>
            </section>

            {/* ── CAPABILITY TICKER ── */}
            <section
                aria-hidden="true"
                className="relative z-10 overflow-hidden border-y border-[var(--home-border-soft)] bg-[var(--home-ticker)] py-5"
            >
                <div className="flex w-max animate-home-marquee hover:[animation-play-state:paused]">
                    {[0, 1].map((copy) => (
                        <div key={copy} className="flex items-center gap-10 pr-10">
                            {capabilities.map((capability) => (
                                <span
                                    key={`${copy}-${capability}`}
                                    className="flex items-center gap-3 whitespace-nowrap text-[11px] uppercase tracking-[0.2em] text-[var(--home-muted)]"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
                                    {capability}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── ABOUT ── */}
            <section id="about" className="mt-14 relative z-10 px-6 pb-16 scroll-mt-10">
                <Reveal className="max-w-3xl mx-auto text-center">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-400/20 text-[var(--home-accent)]">
                        What is LIS?
                    </span>
                    <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
                        Everything your laboratory runs on
                    </h2>
                    <p className="mt-4 text-[var(--home-body)] leading-relaxed">
                        LIS brings the daily operations of a laboratory together. Staff can register
                        patients, process tests, publish reports, and collect payments without jumping
                        between disconnected tools. Data stays organized, traceable, and available to
                        the people who need it.
                    </p>
                </Reveal>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {benefits.map((benefit, index) => (
                        <Reveal key={benefit} delay={index * 70}>
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-[var(--home-chip)] border border-[var(--home-border)] text-[var(--home-body-strong)]">
                                <CheckCircle2 size={15} className="text-[var(--home-icon)]" />
                                {benefit}
                            </span>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="relative z-10 px-6 pb-20">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-[var(--home-border)] bg-[var(--home-border)]">
                    {stats.map(({ value, suffix, label }, index) => (
                        <Reveal key={label} delay={index * 90}>
                            <div
                                className="h-full bg-[var(--home-panel)] px-6 py-7 text-center"
                                role="group"
                                aria-label={`${value}${suffix} ${label}`}
                            >
                                <p className="text-3xl font-black tracking-tight text-[var(--home-heading)]" aria-hidden="true">
                                    <CountUp value={value} suffix={suffix} />
                                </p>
                                <p className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-[var(--home-muted)]" aria-hidden="true">
                                    {label}
                                </p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="relative z-10 px-6 pb-20">
                <div className="max-w-6xl mx-auto">
                    <Reveal className="text-center mb-10">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Built for lab teams
                        </h2>
                        <p className="mt-3 text-[var(--home-body)]">
                            Practical tools that cover the full workflow of a diagnostic laboratory.
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map(({ icon: Icon, title, description }, index) => (
                            <Reveal key={title} delay={(index % 3) * 80}>
                                <article className="group h-full rounded-2xl p-6 bg-[var(--home-card)] border border-[var(--home-border)] hover:border-emerald-400/30 hover:bg-[var(--home-card-hover)] transition-all duration-200 hover:-translate-y-1">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                        <Icon size={20} className="text-[var(--home-icon)]" />
                                    </div>
                                    <h3 className="font-semibold text-[var(--home-heading)]">{title}</h3>
                                    <p className="mt-2 text-sm text-[var(--home-body)] leading-relaxed">
                                        {description}
                                    </p>
                                </article>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="relative z-10 px-6 pb-20">
                <div className="max-w-6xl mx-auto">
                    <Reveal className="text-center mb-10">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-400/20 text-[var(--home-accent)]">
                            How it works
                        </span>
                        <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
                            Three simple steps
                        </h2>
                        <p className="mt-3 text-[var(--home-body)]">
                            From the first visit to the final report, the flow stays clear.
                        </p>
                    </Reveal>

                    <div className="relative">
                        {/* Animated connector between steps */}
                        <div className="hidden md:block pointer-events-none absolute top-[2.875rem] left-[16%] right-[16%] h-px bg-[linear-gradient(90deg,transparent,rgba(52,211,153,0.5),rgba(52,211,153,0.5),transparent)] bg-[length:200%_100%] animate-home-flow" />

                        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
                            {steps.map(({ icon: Icon, step, title, description }, index) => (
                                <Reveal key={step} delay={index * 100}>
                                    <article className="relative h-full rounded-2xl p-6 bg-[var(--home-panel)] border border-[var(--home-border)] hover:border-emerald-400/30 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center">
                                                <Icon size={20} className="text-[var(--home-icon)]" />
                                            </div>
                                            <span className="text-2xl font-black text-[var(--home-step)]">{step}</span>
                                        </div>
                                        <h3 className="font-semibold text-[var(--home-heading)]">{title}</h3>
                                        <p className="mt-2 text-sm text-[var(--home-body)] leading-relaxed">
                                            {description}
                                        </p>
                                    </article>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOR EVERY ROLE ── */}
            <section className="relative z-10 px-6 pb-20">
                <div className="max-w-6xl mx-auto">
                    <Reveal className="text-center mb-10">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            One system, every role
                        </h2>
                        <p className="mt-3 text-[var(--home-body)]">
                            Everyone in the lab sees the tools they need — nothing more, nothing less.
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {roles.map(({ icon: Icon, title, description }, index) => (
                            <Reveal key={title} delay={index * 100}>
                                <article className="h-full rounded-2xl p-6 bg-[var(--home-card)] border border-[var(--home-border)] hover:border-emerald-400/25 transition-colors">
                                    <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center mb-4">
                                        <Icon size={20} className="text-[var(--home-icon)]" />
                                    </div>
                                    <h3 className="font-semibold text-[var(--home-heading)]">{title}</h3>
                                    <p className="mt-2 text-sm text-[var(--home-body)] leading-relaxed">
                                        {description}
                                    </p>
                                </article>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="relative z-10 px-6 pb-12">
                <Reveal className="max-w-4xl mx-auto">
                    <div className="relative overflow-hidden rounded-3xl p-px">
                        {/* Rotating conic border */}
                        <div className="pointer-events-none absolute inset-[-100%] animate-home-spin-slow bg-[conic-gradient(from_0deg,rgba(16,185,129,0.7),transparent_28%,rgba(20,184,166,0.7)_58%,transparent_85%)]" />

                        <div className="relative rounded-[calc(1.5rem-1px)] bg-[var(--home-panel)] bg-gradient-to-br from-emerald-500/[0.07] via-transparent to-teal-500/[0.07] px-8 py-12 text-center">
                            <Sparkles size={22} className="text-[var(--home-icon)] mx-auto mb-4 animate-home-pulse" />
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Ready to run your lab from one place?
                            </h2>
                            <p className="mt-3 text-[var(--home-body)] text-sm sm:text-base">
                                Sign in to your lab workspace and pick up where you left off.
                            </p>
                            <div className="mt-7">
                                <Link
                                    to="/lab/login"
                                    className="group relative inline-flex items-center gap-2 px-7 py-3 rounded-xl overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-600/30 hover:from-emerald-400 hover:to-teal-500 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--home-bg)]"
                                >
                                    <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/25 blur-md -skew-x-12 -translate-x-full group-hover:animate-home-shine" />
                                    <span className="relative">Lab Login</span>
                                    <ArrowRight size={17} className="relative group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ── FOOTER ── */}
            <footer className="relative z-10 border-t border-[var(--home-border-soft)] px-6 py-8">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--home-muted)]">
                    <div className="flex items-center gap-2">
                        <FlaskConical size={15} className="text-[var(--home-icon)]" />
                        <span className="font-semibold text-[var(--home-body)]">LIS Platform</span>
                    </div>
                    <p>Laboratory Information System</p>
                </div>
            </footer>

            <style>{`
                .home-dark {
                    --home-bg: #030d09;
                    --home-heading: #ffffff;
                    --home-body: #94a3b8;
                    --home-body-strong: #cbd5e1;
                    --home-muted: #64748b;
                    --home-border: rgba(255,255,255,0.08);
                    --home-border-soft: rgba(255,255,255,0.06);
                    --home-card: rgba(255,255,255,0.03);
                    --home-card-hover: rgba(255,255,255,0.05);
                    --home-chip: rgba(255,255,255,0.04);
                    --home-panel: #05110c;
                    --home-ticker: rgba(255,255,255,0.02);
                    --home-grid: rgba(255,255,255,0.9);
                    --home-step: rgba(255,255,255,0.10);
                    --home-accent: #6ee7b7;
                    --home-accent-soft: rgba(110,231,183,0.6);
                    --home-icon: #34d399;
                    --home-title-from: #ffffff;
                    --home-title-via: #a7f3d0;
                }

                .home-light {
                    --home-bg: #f8fafc;
                    --home-heading: #0f172a;
                    --home-body: #475569;
                    --home-body-strong: #334155;
                    --home-muted: #64748b;
                    --home-border: rgba(15,23,42,0.10);
                    --home-border-soft: rgba(15,23,42,0.07);
                    --home-card: #ffffff;
                    --home-card-hover: #f8fafc;
                    --home-chip: #ffffff;
                    --home-panel: #ffffff;
                    --home-ticker: rgba(15,23,42,0.025);
                    --home-grid: rgba(15,23,42,0.9);
                    --home-step: rgba(15,23,42,0.10);
                    --home-accent: #047857;
                    --home-accent-soft: rgba(4,120,87,0.65);
                    --home-icon: #059669;
                    --home-title-from: #065f46;
                    --home-title-via: #10b981;
                }

                .home-title {
                    background-image: linear-gradient(90deg, var(--home-title-from), var(--home-title-via), var(--home-title-from));
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }

                @keyframes home-float {
                    0%, 100% { transform: translateY(0); opacity: 0.45; }
                    50% { transform: translateY(-14px); opacity: 1; }
                }
                @keyframes home-float-slow {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(18px) scale(1.04); }
                }
                @keyframes home-ping {
                    0% { transform: scale(0.8); opacity: 0.7; }
                    80%, 100% { transform: scale(1.6); opacity: 0; }
                }
                @keyframes home-rise {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes home-fade {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes home-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(5px); }
                }
                @keyframes home-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.12); opacity: 1; }
                }
                @keyframes home-shimmer {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes home-orbit {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes home-glow {
                    0%, 100% { box-shadow: 0 20px 45px -12px rgba(5, 150, 105, 0.5); }
                    50% { box-shadow: 0 20px 58px -8px rgba(16, 185, 129, 0.85); }
                }
                @keyframes home-flask {
                    0%, 100% { transform: rotate(0deg); }
                    35% { transform: rotate(-6deg); }
                    70% { transform: rotate(6deg); }
                }
                @keyframes home-shine {
                    from { transform: translateX(-100%) skewX(-12deg); }
                    to { transform: translateX(400%) skewX(-12deg); }
                }
                @keyframes home-marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                @keyframes home-flow {
                    from { background-position: 0% 0; }
                    to { background-position: -200% 0; }
                }
                @keyframes home-spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-home-float { animation: home-float 5s ease-in-out infinite; }
                .animate-home-float-slow { animation: home-float-slow 8s ease-in-out infinite; }
                .animate-home-ping { animation: home-ping 2.4s ease-out infinite; }
                .animate-home-rise { animation: home-rise 0.7s ease-out both; }
                .animate-home-fade { animation: home-fade 0.7s ease-out both; }
                .animate-home-bounce { animation: home-bounce 1.8s ease-in-out infinite; }
                .animate-home-pulse { animation: home-pulse 2.6s ease-in-out infinite; }
                .animate-home-shimmer { animation: home-shimmer 6s linear infinite; }
                .animate-home-orbit { animation: home-orbit 14s linear infinite; }
                .animate-home-glow { animation: home-glow 4s ease-in-out infinite; }
                .animate-home-flask { animation: home-flask 5s ease-in-out infinite; }
                .animate-home-shine { animation: home-shine 0.9s ease-out; }
                .animate-home-marquee { animation: home-marquee 26s linear infinite; }
                .animate-home-flow { animation: home-flow 3s linear infinite; }
                .animate-home-spin-slow { animation: home-spin-slow 9s linear infinite; }

                @media (prefers-reduced-motion: reduce) {
                    .animate-home-float,
                    .animate-home-float-slow,
                    .animate-home-ping,
                    .animate-home-rise,
                    .animate-home-fade,
                    .animate-home-bounce,
                    .animate-home-pulse,
                    .animate-home-shimmer,
                    .animate-home-orbit,
                    .animate-home-glow,
                    .animate-home-flask,
                    .animate-home-shine,
                    .animate-home-marquee,
                    .animate-home-flow,
                    .animate-home-spin-slow {
                        animation: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
