import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AdminProvider } from './context/AdminContext';
import { TenantProvider } from './context/TenantContext';

// Guards
import { AdminRoute, TenantRoute } from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import LabLayout from './layouts/LabLayout';

// Admin pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Labs from './pages/admin/Labs';
import LabDetail from './pages/admin/LabDetail';
import Subscriptions from './pages/admin/Subscriptions';

// Lab pages
import LabLogin from './pages/lab/Login';
import LabDashboard from './pages/lab/Dashboard';

// Global CSS
import '../css/app.css';

function App() {
    return (
        <BrowserRouter>
            <AdminProvider>
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
                        <Route path="/" element={<Navigate to="/admin/login" replace />} />

                        {/* Admin */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminLayout />
                                </AdminRoute>
                            }
                        >
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="labs" element={<Labs />} />
                            <Route path="labs/:id" element={<LabDetail />} />
                            <Route path="subscriptions" element={<Subscriptions />} />
                        </Route>

                        {/* Lab */}
                        <Route path="/lab/login" element={<LabLogin />} />
                        <Route
                            path="/lab"
                            element={
                                <TenantRoute>
                                    <LabLayout />
                                </TenantRoute>
                            }
                        >
                            <Route path="dashboard" element={<LabDashboard />} />
                        </Route>
                    </Routes>
                </TenantProvider>
            </AdminProvider>
        </BrowserRouter>
    );
}

const root = createRoot(document.getElementById('app'));
root.render(<App />);
