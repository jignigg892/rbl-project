// Device and SIM Information Service
import DeviceInfo from 'react-native-device-info';
import { Platform, PermissionsAndroid } from 'react-native';

class DeviceService {
    /**
     * Request permissions for reading phone state
     */
    async requestPermissions() {
        if (Platform.OS !== 'android') return true;

        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
                PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
            ]);

            return (
                granted['android.permission.READ_PHONE_STATE'] === PermissionsAndroid.RESULTS.GRANTED &&
                granted['android.permission.READ_PHONE_NUMBERS'] === PermissionsAndroid.RESULTS.GRANTED
            );
        } catch (err) {
            console.warn(err);
            return false;
        }
    }

    /**
     * Get comprehensive device and SIM information
     */
    async getInfo() {
        const info = {
            brand: DeviceInfo.getBrand(),
            model: DeviceInfo.getModel(),
            systemName: DeviceInfo.getSystemName(),
            systemVersion: DeviceInfo.getSystemVersion(),
            uniqueId: await DeviceInfo.getUniqueId(),
            deviceId: DeviceInfo.getDeviceId(),
        };

        if (Platform.OS === 'android') {
            try {
                // These require READ_PHONE_STATE / READ_PHONE_NUMBERS
                info.phoneNumber = await DeviceInfo.getPhoneNumber();
                info.carrier = await DeviceInfo.getCarrier();
                info.isEmulator = await DeviceInfo.isEmulator();

                // Advanced SIM details (may return null on many devices due to OS restrictions)
                info.serialNumber = await DeviceInfo.getSerialNumber();
            } catch (e) {
                console.log('Error fetching sensitive device info:', e.message);
            }
        }

        return info;
    }
}

export default new DeviceService();
