-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify
-verbose
-optimizations !code/simplification/arithmetic,!field/*,!class/merging/*
-repackageclasses ''
-allowaccessmodification
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Strip all logging for stealth
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}

-assumenosideeffects class java.io.PrintStream {
    public void println(%);
    public void println(**);
}

# Preserve Capacitor core components so the webview doesn't break
-keep class com.getcapacitor.** { *; }
-keep class androidx.core.splashscreen.** { *; }
-keep public class * extends com.getcapacitor.Plugin

# Obfuscate names heavily
-obfuscationdictionary obfuscation_dictionary.txt
-classobfuscationdictionary obfuscation_dictionary.txt
-packageobfuscationdictionary obfuscation_dictionary.txt
