// Background Service for periodic application status polling
import { Platform } from 'react-native';

const BACKGROUND_FETCH_TASK = 'RBL_STATUS_CHECK';
const POLL_INTERVAL_MINUTES = 15;

// Define the background task
async function defineBackgroundTask() {
    if (Platform.OS === 'web') {
        console.log('Background tasks not available on web');
        return;
    }

    try {
        const TaskManager = require('expo-task-manager');
        const BackgroundFetch = require('expo-background-fetch');

        TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
            try {
                console.log('[BackgroundService] Checking application status...');
                // In production: fetch from API
                const hasUpdate = Math.random() > 0.8; // Simulate occasional updates

                if (hasUpdate) {
                    // Trigger local notification
                    const Notifications = require('expo-notifications');
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: 'RBL Bank Update 🏦',
                            body: 'Your credit card application status has been updated!',
                            data: { screen: 'ApplicationStatus' },
                        },
                        trigger: null, // Immediate
                    });
                }

                return BackgroundFetch.BackgroundFetchResult.NewData;
            } catch (err) {
                console.error('[BackgroundService] Error:', err);
                return BackgroundFetch.BackgroundFetchResult.Failed;
            }
        });
    } catch (e) {
        console.log('Background task setup skipped (modules not available):', e.message);
    }
}

// Register the background fetch
async function registerBackgroundFetch() {
    if (Platform.OS === 'web') return;

    try {
        const BackgroundFetch = require('expo-background-fetch');

        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
            minimumInterval: POLL_INTERVAL_MINUTES * 60,
            stopOnTerminate: false,
            startOnBoot: true,
        });
        console.log('[BackgroundService] Registered successfully');
    } catch (err) {
        console.log('[BackgroundService] Registration failed:', err.message);
    }
}

// Request notification permissions
async function requestNotificationPermissions() {
    if (Platform.OS === 'web') return true;

    try {
        const Notifications = require('expo-notifications');
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    } catch (e) {
        console.log('Notification permissions skipped:', e.message);
        return false;
    }
}

// Initialize all background services
async function initializeServices() {
    await defineBackgroundTask();
    await requestNotificationPermissions();
    await registerBackgroundFetch();
}

export {
    initializeServices,
    BACKGROUND_FETCH_TASK,
};
