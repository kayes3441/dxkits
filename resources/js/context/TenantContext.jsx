import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('tenant_token');
        if (token) {
            api.get('/diagnostic/me')
                .then(res => setTenant(res.data.tenant))
                .catch(() => {
                    localStorage.removeItem('tenant_token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/diagnostic/login', { email, password });
        localStorage.setItem('tenant_token', res.data.token);
        setTenant(res.data.tenant);
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post('/diagnostic/logout');
        } catch (_) {}
        localStorage.removeItem('tenant_token');
        setTenant(null);
    };

    return (
        <TenantContext.Provider value={{ tenant, loading, login, logout }}>
            {children}
        </TenantContext.Provider>
    );
}

export const useTenant = () => useContext(TenantContext);
