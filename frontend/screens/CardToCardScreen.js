import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
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

const CARD_TYPES = [
    { id: 'visa', name: 'Visa', icon: '💳' },
    { id: 'mastercard', name: 'Mastercard', icon: '🔴' },
    { id: 'rupay', name: 'RuPay', icon: '🇮🇳' },
];

export default function CardToCardScreen({ route, navigation }) {
    const [cardData, setCardData] = useState({ cardNumber: '', expiry: '', cvv: '', cardType: '' });
    const [selectedType, setSelectedType] = useState(null);

    const handleNext = () => {
        if (cardData.cardNumber.length >= 16 && cardData.expiry && cardData.cvv.length === 3) {
            navigation.navigate('BankDetails', { ...route.params, cardDetails: { ...cardData, cardType: selectedType } });
        } else {
            Alert.alert('Error', 'Please enter valid card details.');
        }
    };

    return (
        <LinearGradient colors={COLORS.gradientPrimary} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <ProgressBar currentStep={3} />
                <Text style={styles.title}>Card Verification</Text>
                <Text style={styles.subtitle}>Verify an existing credit/debit card for instant approval.</Text>

                {/* Card Type Selection */}
                <Text style={[styles.sectionLabel, { marginBottom: SPACING.m }]}>Select Card Network</Text>
                <View style={styles.cardTypes}>
                    {CARD_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type.id}
                            style={[styles.cardTypeBtn, selectedType === type.id && styles.cardTypeBtnActive]}
                            onPress={() => setSelectedType(type.id)}
                        >
                            <Text style={{ fontSize: 24 }}>{type.icon}</Text>
                            <Text style={[styles.cardTypeName, selectedType === type.id && styles.cardTypeNameActive]}>{type.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.card}>
                    <GlassInput label="Card Number" icon="💳" placeholder="XXXX XXXX XXXX XXXX" keyboardType="numeric" maxLength={16}
                        value={cardData.cardNumber} onChangeText={(t) => setCardData({ ...cardData, cardNumber: t })} />
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: SPACING.m }}>
                            <GlassInput label="Expiry" icon="📅" placeholder="MM/YY" maxLength={5}
                                value={cardData.expiry} onChangeText={(t) => setCardData({ ...cardData, expiry: t })} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <GlassInput label="CVV" icon="🔒" placeholder="•••" keyboardType="numeric" maxLength={3} secureTextEntry
                                value={cardData.cvv} onChangeText={(t) => setCardData({ ...cardData, cvv: t })} />
                        </View>
                    </View>
                </View>

                <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
                    <LinearGradient colors={COLORS.gradientRed} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
                        <Text style={styles.buttonText}>VERIFY CARD</Text>
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
    sectionLabel: { ...TYPOGRAPHY.caption, color: COLORS.accent, fontWeight: '600' },

    cardTypes: { flexDirection: 'row', marginBottom: SPACING.xl },
    cardTypeBtn: {
        flex: 1, alignItems: 'center', paddingVertical: SPACING.m,
        backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.m,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginRight: SPACING.s,
    },
    cardTypeBtnActive: { borderColor: COLORS.accent, backgroundColor: 'rgba(201,168,76,0.1)' },
    cardTypeName: { ...TYPOGRAPHY.small, color: COLORS.textMuted, marginTop: 4 },
    cardTypeNameActive: { color: COLORS.accent },

    card: { ...GLASS_CARD, padding: SPACING.l, marginBottom: SPACING.l },
    row: { flexDirection: 'row' },
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
