import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, COMPONENTS, GLASS_CARD } from '../constants/Theme';

const STEPS = ['Personal', 'KYC', 'Work', 'Bank', 'Upload', 'Done'];

function ProgressBar({ currentStep = 0 }) {
    return (
        <View style={progressStyles.container}>
            <View style={progressStyles.track}>
                <LinearGradient
                    colors={COLORS.gradientAccent}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[progressStyles.fill, { width: `${((currentStep + 1) / STEPS.length) * 100}%` }]}
                />
            </View>
            <View style={progressStyles.labels}>
                {STEPS.map((step, i) => (
                    <Text key={i} style={[progressStyles.label, i <= currentStep && progressStyles.labelActive]}>
                        {step}
                    </Text>
                ))}
            </View>
        </View>
    );
}

const progressStyles = StyleSheet.create({
    container: { marginBottom: SPACING.xl },
    track: { height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 2 },
    labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.s },
    label: { ...TYPOGRAPHY.small, color: COLORS.textMuted },
    labelActive: { color: COLORS.accent },
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

export default function PersonalDetailsScreen({ navigation }) {
    const [formData, setFormData] = useState({ fullName: '', email: '', mobile: '' });

    const handleChange = (name, value) => setFormData({ ...formData, [name]: value });

    const handleNext = () => {
        if (formData.fullName && formData.email && formData.mobile) {
            navigation.navigate('KYCDetails', { personalDetails: formData });
        } else {
            alert('Please fill all fields');
        }
    };

    return (
        <LinearGradient colors={COLORS.gradientPrimary} style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <ProgressBar currentStep={0} />

                    <Text style={styles.title}>Personal Information</Text>
                    <Text style={styles.subtitle}>Tell us about yourself. Your data is encrypted end-to-end.</Text>

                    <View style={styles.card}>
                        <GlassInput
                            label="Full Name"
                            icon="👤"
                            placeholder="As per PAN Card"
                            value={formData.fullName}
                            onChangeText={(t) => handleChange('fullName', t)}
                        />
                        <GlassInput
                            label="Email Address"
                            icon="📧"
                            placeholder="yourname@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={formData.email}
                            onChangeText={(t) => handleChange('email', t)}
                        />
                        <GlassInput
                            label="Mobile Number"
                            icon="📱"
                            placeholder="10-digit mobile number"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={formData.mobile}
                            onChangeText={(t) => handleChange('mobile', t)}
                        />
                    </View>

                    <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
                        <LinearGradient
                            colors={COLORS.gradientRed}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>CONTINUE</Text>
                            <Text style={styles.buttonArrow}>→</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.securityBadge}>
                        <Text style={styles.securityText}>🔒 256-bit SSL Encrypted</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: SPACING.l, paddingBottom: SPACING.xxxl },
    title: { ...TYPOGRAPHY.h1, color: COLORS.white, marginBottom: SPACING.xs },
    subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },

    card: {
        ...GLASS_CARD,
        padding: SPACING.l,
        marginBottom: SPACING.l,
    },

    inputGroup: { marginBottom: SPACING.l },
    label: { ...TYPOGRAPHY.caption, color: COLORS.accent, marginBottom: SPACING.s, fontWeight: '600' },
    input: {
        ...COMPONENTS.input,
    },
    inputFocused: {
        ...COMPONENTS.inputFocused,
    },

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

    securityBadge: { alignItems: 'center', marginTop: SPACING.l },
    securityText: { ...TYPOGRAPHY.small, color: COLORS.textMuted },
});
