const variants = {
    active:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
    trial:     'bg-blue-100 text-blue-700 border border-blue-200',
    suspended: 'bg-orange-100 text-orange-700 border border-orange-200',
    expired:   'bg-red-100 text-red-700 border border-red-200',
    basic:     'bg-slate-100 text-slate-700 border border-slate-200',
    standard:  'bg-indigo-100 text-indigo-700 border border-indigo-200',
    premium:   'bg-purple-100 text-purple-700 border border-purple-200',
    paid:      'bg-emerald-100 text-emerald-700 border border-emerald-200',
    pending:   'bg-yellow-100 text-yellow-700 border border-yellow-200',
    overdue:   'bg-red-100 text-red-700 border border-red-200',
    default:   'bg-gray-100 text-gray-700 border border-gray-200',
};

export default function Badge({ label, variant }) {
    const cls = variants[variant] || variants.default;
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
            {label}
        </span>
    );
}
