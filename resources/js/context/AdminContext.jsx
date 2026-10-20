import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            api.get('/admin/me')
                .then(res => setAdmin(res.data.user))
                .catch(() => {
                    localStorage.removeItem('admin_token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/admin/login', { email, password });
        localStorage.setItem('admin_token', res.data.token);
        setAdmin(res.data.user);
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post('/admin/logout');
        } catch (_) {}
        localStorage.removeItem('admin_token');
        setAdmin(null);
    };

    return (
        <AdminContext.Provider value={{ admin, loading, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
}

export const useAdmin = () => useContext(AdminContext);
