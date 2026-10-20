import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { SuperAdminProvider } from './context/SuperAdminContext';
import { TenantProvider } from './context/TenantContext';

// Guards
import { SuperAdminRoute, TenantRoute } from './components/ProtectedRoute';

// Layouts
import SuperAdminLayout from './layouts/SuperAdminLayout';
import DiagnosticLayout from './layouts/DiagnosticLayout';

// SuperAdmin pages
import SuperAdminLogin from './pages/superadmin/Login';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import Diagnostics from './pages/superadmin/Diagnostics';
import DiagnosticDetail from './pages/superadmin/DiagnosticDetail';
import Subscriptions from './pages/superadmin/Subscriptions';

// Diagnostic pages
import DiagnosticLogin from './pages/diagnostic/Login';
import DiagnosticDashboard from './pages/diagnostic/Dashboard';

// Global CSS
import '../css/app.css';

function App() {
    return (
        <BrowserRouter>
            <SuperAdminProvider>
                <TenantProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                            },
                        }}
                    />
                    <Routes>
                        {/* Root redirect */}
                        <Route path="/" element={<Navigate to="/superadmin/login" replace />} />

                        {/* SuperAdmin */}
                        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
                        <Route
                            path="/superadmin"
                            element={
                                <SuperAdminRoute>
                                    <SuperAdminLayout />
                                </SuperAdminRoute>
                            }
                        >
                            <Route path="dashboard" element={<SuperAdminDashboard />} />
                            <Route path="diagnostics" element={<Diagnostics />} />
                            <Route path="diagnostics/:id" element={<DiagnosticDetail />} />
                            <Route path="subscriptions" element={<Subscriptions />} />
                        </Route>

                        {/* Diagnostic Center */}
                        <Route path="/diagnostic/login" element={<DiagnosticLogin />} />
                        <Route
                            path="/diagnostic"
                            element={
                                <TenantRoute>
                                    <DiagnosticLayout />
                                </TenantRoute>
                            }
                        >
                            <Route path="dashboard" element={<DiagnosticDashboard />} />
                        </Route>
                    </Routes>
                </TenantProvider>
            </SuperAdminProvider>
        </BrowserRouter>
    );
}

const root = createRoot(document.getElementById('app'));
root.render(<App />);
