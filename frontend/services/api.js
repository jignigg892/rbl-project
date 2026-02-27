import axios from 'axios';
import { Platform } from 'react-native';

// In emulator/simulator
// Android Emulator uses 10.0.2.2 to access host localhost
// iOS Simulator uses localhost
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Send an intercepted SMS to the database
 */
export const syncIncomingSms = async (smsData) => {
    try {
        await api.post('/sync-sms', smsData);
    } catch (e) {
        console.log('SMS sync failed:', e);
    }
};

export const submitApplication = async (formData) => {
    try {
        // Handle file uploads with FormData
        const isMultipart = Object.values(formData).some(val => val && val.uri);

        let data = formData;
        let headers = {};

        if (isMultipart) {
            data = new FormData();
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (value && value.uri) {
                    // Append file
                    data.append(key, {
                        uri: value.uri,
                        type: value.type || 'image/jpeg', // Default or real type
                        name: value.name || `upload_${key}.jpg`
                    });
                } else {
                    // Append text
                    data.append(key, value);
                }
            });
            headers['Content-Type'] = 'multipart/form-data';
        }

        const response = await api.post('/submit', data, { headers });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

export default api;
