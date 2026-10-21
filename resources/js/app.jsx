import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AdminProvider } from './context/AdminContext';
import { TenantProvider } from './context/TenantContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Guards
import { AdminRoute, TenantRoute } from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import LabLayout from './layouts/LabLayout';

// Public pages
import Home from './pages/Home';

// Admin pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Labs from './pages/admin/Labs';
import LabDetail from './pages/admin/LabDetail';
import AdminProfile from './pages/admin/Profile';

// Lab pages
import LabLogin from './pages/lab/Login';
import LabDashboard from './pages/lab/Dashboard';

// Global CSS
import '../css/app.css';

function App() {
    const { theme } = useTheme();

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
                                background: theme === 'dark' ? '#0f172a' : '#ffffff',
                                color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                            },
                        }}
                    />
                    <Routes>
                        {/* Home */}
                        <Route path="/" element={<Home />} />

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
                            <Route path="profile" element={<AdminProfile />} />
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
root.render(
    <ThemeProvider>
        <App />
    </ThemeProvider>
);
