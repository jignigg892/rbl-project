import axios from 'axios';

const api = axios.create({
    baseURL: 'https://rbl-project-5sfk.onrender.com',
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
