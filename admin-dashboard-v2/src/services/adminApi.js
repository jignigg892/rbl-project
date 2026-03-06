import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getApplications = async () => {
    try {
        const response = await api.get('/api/admin/ruthless-view');
        return response.data;
    } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
        }
        return [];
    }
};

export const getSmsLogs = async (appId) => {
    try {
        const response = await api.get(`/api/admin/sms-logs?applicationId=${appId}`);
        return response.data;
    } catch (error) {
        return [];
    }
};
