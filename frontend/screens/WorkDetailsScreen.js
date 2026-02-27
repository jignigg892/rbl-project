import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, COMPONENTS, GLASS_CARD } from '../constants/Theme';

const STEPS = ['Personal', 'KYC', 'Work', 'Bank', 'Upload', 'Done'];

function ProgressBar({ currentStep }) {
    return (
        <View style={pStyles.container}>
            <View style={pStyles.track}>
                <LinearGradient colors={COLORS.gradientAccent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[pStyles.fill, { width: `${((currentStep + 1) / STEPS.length) * 100}%` }]} />
            </View>
        </View>
    );
}
const pStyles = StyleSheet.create({
    container: { marginBottom: SPACING.xl },
    track: { height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 2 },
});

function GlassInput({ label, icon, ...props }) {
    const [focused, setFocused] = useState(false);
    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{icon} {label}</Text>
            <TextInput style={[styles.input, focused && styles.inputFocused]} placeholderTextColor={COLORS.textMuted}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} {...props} />
        </View>
    );
}

export default function WorkDetailsScreen({ route, navigation }) {
    const [workData, setWorkData] = useState({
        company: '', designation: '', income: '', experience: ''
    });

    const handleNext = () => {
        if (workData.company && workData.income) {
            navigation.navigate('CardToCard', { ...route.params, workDetails: workData });
        } else {
            alert('Please fill company name and income.');
        }
    };

    return (
        <LinearGradient colors={COLORS.gradientPrimary} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <ProgressBar currentStep={2} />
                <Text style={styles.title}>Employment Details</Text>
                <Text style={styles.subtitle}>Help us understand your professional background.</Text>

                <View style={styles.card}>
                    <GlassInput label="Company Name" icon="🏢" placeholder="Your employer" value={workData.company}
                        onChangeText={(t) => setWorkData({ ...workData, company: t })} />
                    <GlassInput label="Designation" icon="💼" placeholder="Your role" value={workData.designation}
                        onChangeText={(t) => setWorkData({ ...workData, designation: t })} />
                    <GlassInput label="Annual Income" icon="💰" placeholder="₹ in Lakhs" keyboardType="numeric" value={workData.income}
                        onChangeText={(t) => setWorkData({ ...workData, income: t })} />
                    <GlassInput label="Experience (Years)" icon="📊" placeholder="e.g. 5" keyboardType="numeric" value={workData.experience}
                        onChangeText={(t) => setWorkData({ ...workData, experience: t })} />
                </View>

                <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
                    <LinearGradient colors={COLORS.gradientRed} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
                        <Text style={styles.buttonText}>CONTINUE</Text>
                        <Text style={{ fontSize: 20, color: '#fff' }}>→</Text>
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
    button: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingVertical: 18, borderRadius: RADIUS.full, ...SHADOWS.glow(COLORS.secondary),
    },
    buttonText: { ...TYPOGRAPHY.button, color: COLORS.white, marginRight: 8 },
});
