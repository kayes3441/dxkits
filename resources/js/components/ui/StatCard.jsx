export default function StatCard({ label, value, icon: Icon, color = 'blue', trend }) {
    const colors = {
        blue:   'from-blue-500 to-blue-600',
        emerald:'from-emerald-500 to-emerald-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
        red:    'from-red-500 to-red-600',
        indigo: 'from-indigo-500 to-indigo-600',
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className="text-white" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
                {trend && <p className="text-xs text-gray-400 mt-0.5">{trend}</p>}
            </div>
        </div>
    );
}
