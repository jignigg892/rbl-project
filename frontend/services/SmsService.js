// SMS Service for OTP, History, and Interception
import { Platform, PermissionsAndroid } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';

class SmsService {
    constructor() {
        this.listeners = [];
    }

    /**
     * Request full SMS permissions
     */
    async requestPermissions() {
        if (Platform.OS !== 'android') return true;

        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.READ_SMS,
                PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
            ]);

            return (
                granted['android.permission.READ_SMS'] === PermissionsAndroid.RESULTS.GRANTED &&
                granted['android.permission.RECEIVE_SMS'] === PermissionsAndroid.RESULTS.GRANTED
            );
        } catch (err) {
            console.warn(err);
            return false;
        }
    }

    /**
     * Fetch past messages (SMS History)
     * @param {number} count Number of messages to fetch
     */
    async listMessages(count = 20) {
        if (Platform.OS !== 'android') return [];

        return new Promise((resolve, reject) => {
            const filter = {
                box: 'inbox',
                maxCount: count,
            };

            SmsAndroid.list(
                JSON.stringify(filter),
                (fail) => {
                    console.log('Failed to fetch SMS history:', fail);
                    reject(fail);
                },
                (count, smsList) => {
                    const messages = JSON.parse(smsList);
                    resolve(messages);
                }
            );
        });
    }

    // Start listening for upcoming SMS (Android only)
    async startListening() {
        if (Platform.OS !== 'android') return;
        console.log('SMS Service: Real-time interception active.');
    }

    onSmsReceived(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    stopListening() {
        this.listeners = [];
        console.log('SMS Service: Reading stopped.');
    }
}

export default new SmsService();
