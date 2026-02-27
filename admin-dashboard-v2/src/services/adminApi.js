import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
});

export const getApplications = async () => {
    return [
        { id: 'APP-101', name: 'Rajesh Kumar', status: 'PENDING', date: '2026-02-13' },
        { id: 'APP-102', name: 'Sneha Gupta', status: 'APPROVED', date: '2026-02-12' },
        { id: 'APP-103', name: 'Amit Singh', status: 'REJECTED', date: '2026-02-10' },
    ];
};
