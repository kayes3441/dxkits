import { Navigate } from 'react-router-dom';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { useTenant } from '../context/TenantContext';
import Spinner from './ui/Spinner';

export function SuperAdminRoute({ children }) {
    const { admin, loading } = useSuperAdmin();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Spinner size="lg" className="text-blue-400" />
            </div>
        );
    }

    if (!admin) return <Navigate to="/superadmin/login" replace />;
    return children;
}

export function TenantRoute({ children }) {
    const { tenant, loading } = useTenant();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-teal-900">
                <Spinner size="lg" className="text-teal-400" />
            </div>
        );
    }

    if (!tenant) return <Navigate to="/diagnostic/login" replace />;
    return children;
}
