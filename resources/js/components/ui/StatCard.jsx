export default function StatCard({ label, value, icon: Icon, color = 'blue', trend }) {
    const colors = {
        blue:   { bg: 'bg-blue-50', text: 'text-blue-600' },
        emerald:{ bg: 'bg-emerald-50', text: 'text-emerald-600' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
        red:    { bg: 'bg-red-50', text: 'text-red-600' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    };
    const c = colors[color] || colors.blue;

    return (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-center justify-between gap-3">
                <div className={`w-9 h-9 rounded-lg ${c.bg} ${c.text} flex items-center justify-center`}>
                    <Icon size={17} />
                </div>
                {trend && (
                    <span className="text-xs font-medium text-emerald-600">
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-2xl font-semibold text-gray-900 mt-3 tracking-tight">{value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
        </div>
    );
}