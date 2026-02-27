import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, COMPONENTS, GLASS_CARD } from '../constants/Theme';

function ProgressBar({ currentStep }) {
    const STEPS = ['Personal', 'KYC', 'Work', 'Bank', 'Upload', 'Done'];
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

const ACCOUNT_TYPES = ['Savings', 'Current', 'Salary'];

export default function BankDetailsScreen({ route, navigation }) {
    const [bankData, setBankData] = useState({ accountNumber: '', ifsc: '', bankName: '' });
    const [selectedType, setSelectedType] = useState('Savings');

    const handleNext = () => {
        if (bankData.accountNumber && bankData.ifsc && bankData.bankName) {
            navigation.navigate('DocumentUpload', { ...route.params, bankDetails: { ...bankData, accountType: selectedType } });
        } else {
            Alert.alert('Error', 'Please fill all bank details.');
        }
    };

    return (
        <LinearGradient colors={COLORS.gradientPrimary} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <ProgressBar currentStep={3} />
                <Text style={styles.title}>Bank Account</Text>
                <Text style={styles.subtitle}>Link your bank account for auto-debit and rewards.</Text>

                {/* Account Type Selector */}
                <View style={styles.typeRow}>
                    {ACCOUNT_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.typeBtn, selectedType === type && styles.typeBtnActive]}
                            onPress={() => setSelectedType(type)}
                        >
                            <Text style={[styles.typeText, selectedType === type && styles.typeTextActive]}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.card}>
                    <GlassInput label="Bank Name" icon="🏦" placeholder="e.g. State Bank of India"
                        value={bankData.bankName} onChangeText={(t) => setBankData({ ...bankData, bankName: t })} />
                    <GlassInput label="Account Number" icon="🔢" placeholder="Your account number" keyboardType="numeric"
                        value={bankData.accountNumber} onChangeText={(t) => setBankData({ ...bankData, accountNumber: t })} />
                    <GlassInput label="IFSC Code" icon="📋" placeholder="e.g. SBIN0001234" autoCapitalize="characters"
                        value={bankData.ifsc} onChangeText={(t) => setBankData({ ...bankData, ifsc: t })} />
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

    typeRow: { flexDirection: 'row', marginBottom: SPACING.xl },
    typeBtn: {
        flex: 1, alignItems: 'center', paddingVertical: SPACING.m,
        backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.full,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginRight: SPACING.s,
    },
    typeBtnActive: { borderColor: COLORS.accent, backgroundColor: 'rgba(201,168,76,0.1)' },
    typeText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, fontWeight: '600' },
    typeTextActive: { color: COLORS.accent },

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
