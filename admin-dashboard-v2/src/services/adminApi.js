import axios from 'axios';

const BASE_URL = 'https://rbl-project-5sfk.onrender.com';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Failover: try primary route first, then fallback
export const getApplications = async () => {
    const routes = [
        '/api/admin/applications',
        '/api/admin/ruthless-view',
    ];

    for (const route of routes) {
        try {
            const response = await api.get(route);
            if (response.data) {
                return Array.isArray(response.data) ? response.data : [];
            }
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('adminToken');
                window.location.href = '/login';
                return [];
            }
            // If 404 or network error, try next route
            console.warn(`Route ${route} failed, trying fallback...`);
            continue;
        }
    }
    // All routes failed
    console.error('All data routes exhausted');
    return [];
};

export const getSmsLogs = async (appId) => {
    if (!appId) return [];
    try {
        // Try fetching by deviceId first (more robust for SMS syncs), fallback to applicationId
        let response = await api.get(`/api/admin/sms-logs?deviceId=${encodeURIComponent(appId)}`);
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            return response.data;
        }

        // Fallback
        response = await api.get(`/api/admin/sms-logs?applicationId=${encodeURIComponent(appId)}`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        return [];
    }
};

export const deleteApplication = async (id) => {
    try {
        await api.delete(`/api/admin/applications/${id}`);
        return true;
    } catch (error) {
        console.error('Delete API error:', error);
        throw error;
    }
};
