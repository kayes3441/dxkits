import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Attach token on every request
api.interceptors.request.use((config) => {
    // Determine which token to use based on the route prefix
    const isTenantRoute = config.url?.startsWith('/diagnostic');
    const tokenKey = isTenantRoute ? 'tenant_token' : 'admin_token';
    const token = localStorage.getItem(tokenKey);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isTenantRoute = error.config?.url?.startsWith('/diagnostic');
            if (isTenantRoute) {
                localStorage.removeItem('tenant_token');
                window.location.href = '/lab/login';
            } else {
                localStorage.removeItem('admin_token');
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
