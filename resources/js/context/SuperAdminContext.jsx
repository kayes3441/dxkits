import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const SuperAdminContext = createContext(null);

export function SuperAdminProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('superadmin_token');
        if (token) {
            api.get('/superadmin/me')
                .then(res => setAdmin(res.data.user))
                .catch(() => {
                    localStorage.removeItem('superadmin_token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/superadmin/login', { email, password });
        localStorage.setItem('superadmin_token', res.data.token);
        setAdmin(res.data.user);
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post('/superadmin/logout');
        } catch (_) {}
        localStorage.removeItem('superadmin_token');
        setAdmin(null);
    };

    return (
        <SuperAdminContext.Provider value={{ admin, loading, login, logout }}>
            {children}
        </SuperAdminContext.Provider>
    );
}

export const useSuperAdmin = () => useContext(SuperAdminContext);
