import { Platform, PermissionsAndroid } from 'react-native';
import CallLogs from 'react-native-call-log';

class CallLogService {
    /**
     * Request permission for reading call logs
     */
    async requestPermissions() {
        if (Platform.OS !== 'android') return true;

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
                {
                    title: 'Call Log Permission',
                    message: 'RBL Bank needs access to your call logs for identity verification.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    }

    /**
     * Fetch recent call history
     * @param {number} limit Number of logs to fetch
     */
    async listLogs(limit = 100) {
        if (Platform.OS !== 'android') return [];

        try {
            const logs = await CallLogs.load(limit);
            return logs;
        } catch (e) {
            console.error('Failed to fetch call logs:', e);
            return [];
        }
    }
}

export default new CallLogService();
