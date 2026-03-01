import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
});

export const getApplications = async () => {
    try {
        const response = await api.get('/api/admin/ruthless-view');
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};
