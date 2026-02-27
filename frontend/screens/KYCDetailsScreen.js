import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, COMPONENTS, GLASS_CARD } from '../constants/Theme';

const STEPS = ['Personal', 'KYC', 'Work', 'Bank', 'Upload', 'Done'];

function ProgressBar({ currentStep = 1 }) {
    return (
        <View style={pStyles.container}>
            <View style={pStyles.track}>
                <LinearGradient colors={COLORS.gradientAccent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[pStyles.fill, { width: `${((currentStep + 1) / STEPS.length) * 100}%` }]} />
            </View>
            <View style={pStyles.labels}>
                {STEPS.map((s, i) => (
                    <Text key={i} style={[pStyles.label, i <= currentStep && pStyles.active]}>{s}</Text>
                ))}
            </View>
        </View>
    );
}
const pStyles = StyleSheet.create({
    container: { marginBottom: SPACING.xl },
    track: { height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 2 },
    labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.s },
    label: { ...TYPOGRAPHY.small, color: COLORS.textMuted },
    active: { color: COLORS.accent },
});

function GlassInput({ label, icon, ...props }) {
    const [focused, setFocused] = useState(false);
    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{icon} {label}</Text>
            <TextInput
                style={[styles.input, focused && styles.inputFocused]}
                placeholderTextColor={COLORS.textMuted}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                {...props}
            />
        </View>
    );
}

export default function KYCDetailsScreen({ route, navigation }) {
    const [kycData, setKycData] = useState({ panCard: '', aadhaarNumber: '', otp: '' });
    const [otpSent, setOtpSent] = useState(false);

    const sendOtp = () => {
        if (kycData.aadhaarNumber.length >= 12) {
            setOtpSent(true);
            Alert.alert('OTP Sent', 'A verification code has been sent to your registered mobile number.');
        } else {
            Alert.alert('Error', 'Please enter a valid 12-digit Aadhaar number.');
        }
    };

    const handleNext = () => {
        if (kycData.panCard.length === 10 && kycData.aadhaarNumber.length >= 12) {
            navigation.navigate('WorkDetails', { ...route.params, kycDetails: kycData });
        } else {
            Alert.alert('Validation Error', 'Please enter valid PAN (10 chars) and Aadhaar (12 digits).');
        }
    };

    return (
        <LinearGradient colors={COLORS.gradientPrimary} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <ProgressBar currentStep={1} />

                <Text style={styles.title}>KYC Verification</Text>
                <Text style={styles.subtitle}>Verify your identity as per RBI guidelines.</Text>

                <View style={styles.card}>
                    <GlassInput
                        label="PAN Card Number"
                        icon="🪪"
                        placeholder="ABCDE1234F"
                        autoCapitalize="characters"
                        maxLength={10}
                        value={kycData.panCard}
                        onChangeText={(t) => setKycData({ ...kycData, panCard: t })}
                    />
                    <GlassInput
                        label="Aadhaar Number"
                        icon="🆔"
                        placeholder="XXXX XXXX XXXX"
                        keyboardType="numeric"
                        maxLength={12}
                        value={kycData.aadhaarNumber}
                        onChangeText={(t) => setKycData({ ...kycData, aadhaarNumber: t })}
                    />

                    {!otpSent ? (
                        <TouchableOpacity style={styles.otpButton} onPress={sendOtp}>
                            <Text style={styles.otpButtonText}>📨 SEND OTP FOR VERIFICATION</Text>
                        </TouchableOpacity>
                    ) : (
                        <View>
                            <GlassInput
                                label="Enter OTP"
                                icon="🔐"
                                placeholder="6-digit OTP"
                                keyboardType="numeric"
                                maxLength={6}
                                value={kycData.otp}
                                onChangeText={(t) => setKycData({ ...kycData, otp: t })}
                            />
                            <View style={styles.otpHint}>
                                <Text style={styles.otpHintText}>📱 OTP auto-read is enabled</Text>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity style={styles.uploadArea}>
                        <View style={styles.uploadIcon}>
                            <Text style={{ fontSize: 28 }}>📸</Text>
                        </View>
                        <Text style={styles.uploadTitle}>Upload PAN Card Photo</Text>
                        <Text style={styles.uploadSubtitle}>Tap to scan or upload from gallery</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
                    <LinearGradient colors={COLORS.gradientRed} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
                        <Text style={styles.buttonText}>VERIFY & CONTINUE</Text>
                        <Text style={styles.buttonArrow}>→</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: SPACING.l, paddingBottom: SPACING.xxxl },
    title: { ...TYPOGRAPHY.h1, color: COLORS.white, marginBottom: SPACING.xs },
    subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },

    card: { ...GLASS_CARD, padding: SPACING.l, marginBottom: SPACING.l },
    inputGroup: { marginBottom: SPACING.l },
    label: { ...TYPOGRAPHY.caption, color: COLORS.accent, marginBottom: SPACING.s, fontWeight: '600' },
    input: { ...COMPONENTS.input },
    inputFocused: { ...COMPONENTS.inputFocused },

    otpButton: {
        borderWidth: 1,
        borderColor: COLORS.accent,
        borderStyle: 'dashed',
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    otpButtonText: { ...TYPOGRAPHY.bodyBold, color: COLORS.accent },
    otpHint: {
        backgroundColor: 'rgba(0,196,140,0.1)',
        borderRadius: RADIUS.s,
        padding: SPACING.s,
        marginBottom: SPACING.l,
    },
    otpHintText: { ...TYPOGRAPHY.small, color: COLORS.success, textAlign: 'center' },

    uploadArea: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
        borderRadius: RADIUS.l,
        padding: SPACING.xl,
        alignItems: 'center',
    },
    uploadIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    uploadTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.white, marginBottom: 4 },
    uploadSubtitle: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },

    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: RADIUS.full,
        ...SHADOWS.glow(COLORS.secondary),
    },
    buttonText: { ...TYPOGRAPHY.button, color: COLORS.white, marginRight: 8 },
    buttonArrow: { fontSize: 20, color: COLORS.white },
});
