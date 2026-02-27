import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS } from '../constants/Theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const cardAnim = useRef(new Animated.Value(0.9)).current;
    const shimmerAnim = useRef(new Animated.Value(-1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
            Animated.spring(cardAnim, { toValue: 1, tension: 40, friction: 7, useNativeDriver: true }),
        ]).start();

        // Shimmer loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
                Animated.timing(shimmerAnim, { toValue: -1, duration: 0, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: [-width * 0.85, width * 0.85],
    });

    return (
        <LinearGradient colors={COLORS.gradientPrimary} style={styles.container}>
            {/* Decorative circles */}
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />

            {/* Header */}
            <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                <Text style={styles.bankName}>RBL BANK</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>PREMIUM</Text>
                </View>
            </Animated.View>

            {/* Content */}
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <Text style={styles.title}>Unlock Your{'\n'}Financial Future</Text>
                <Text style={styles.subtitle}>
                    Premium rewards. Instant approval.{'\n'}Zero paperwork.
                </Text>

                {/* 3D Credit Card */}
                <Animated.View style={[styles.cardContainer, { transform: [{ scale: cardAnim }] }]}>
                    <LinearGradient
                        colors={COLORS.gradientCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.card}
                    >
                        {/* Shimmer overlay */}
                        <Animated.View
                            style={[
                                styles.shimmer,
                                { transform: [{ translateX: shimmerTranslate }] },
                            ]}
                        />
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardBankName}>RBL BANK</Text>
                            <Text style={styles.cardType}>PLATINUM PLUS</Text>
                        </View>
                        <View style={styles.cardChipRow}>
                            <View style={styles.chip}>
                                <View style={styles.chipLine} />
                                <View style={styles.chipLine} />
                                <View style={styles.chipLine} />
                            </View>
                            <Text style={styles.contactless}>≋</Text>
                        </View>
                        <Text style={styles.cardNumber}>4532  ••••  ••••  1234</Text>
                        <View style={styles.cardFooter}>
                            <View>
                                <Text style={styles.cardLabel}>CARD HOLDER</Text>
                                <Text style={styles.cardValue}>YOUR NAME</Text>
                            </View>
                            <View>
                                <Text style={styles.cardLabel}>EXPIRES</Text>
                                <Text style={styles.cardValue}>12/29</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Features */}
                <View style={styles.features}>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>🏆</Text>
                        <Text style={styles.featureText}>5X Rewards</Text>
                    </View>
                    <View style={styles.featureDivider} />
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>🌍</Text>
                        <Text style={styles.featureText}>Zero Forex</Text>
                    </View>
                    <View style={styles.featureDivider} />
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>🛡️</Text>
                        <Text style={styles.featureText}>Insured</Text>
                    </View>
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('PersonalDetails')}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={COLORS.gradientRed}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>START APPLICATION</Text>
                        <Text style={styles.buttonArrow}>→</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.footer}>Secure 256-bit Encryption • RBI Regulated</Text>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Decorative background circles
    circle: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.03)' },
    circle1: { width: 300, height: 300, top: -80, right: -80 },
    circle2: { width: 200, height: 200, bottom: 100, left: -60 },
    circle3: { width: 150, height: 150, top: height * 0.3, right: -40 },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: SPACING.l,
    },
    bankName: { ...TYPOGRAPHY.h3, color: COLORS.accent, letterSpacing: 2 },
    badge: {
        backgroundColor: 'rgba(201,168,76,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: 'rgba(201,168,76,0.3)',
    },
    badgeText: { ...TYPOGRAPHY.small, color: COLORS.accent },

    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.l },
    title: { ...TYPOGRAPHY.hero, color: COLORS.white, textAlign: 'center', marginBottom: SPACING.m },
    subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },

    // Credit Card
    cardContainer: { marginBottom: SPACING.xl, ...SHADOWS.large },
    card: {
        width: width * 0.85,
        height: 200,
        borderRadius: RADIUS.l,
        padding: SPACING.l,
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 60,
        backgroundColor: 'rgba(255,255,255,0.1)',
        transform: [{ skewX: '-20deg' }],
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardBankName: { ...TYPOGRAPHY.bodyBold, color: COLORS.white },
    cardType: { ...TYPOGRAPHY.small, color: COLORS.accentLight },
    cardChipRow: { flexDirection: 'row', alignItems: 'center' },
    chip: {
        width: 40,
        height: 30,
        backgroundColor: COLORS.accent,
        borderRadius: 6,
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    chipLine: { height: 1, backgroundColor: 'rgba(0,0,0,0.2)', marginVertical: 2 },
    contactless: { fontSize: 24, color: 'rgba(255,255,255,0.5)', marginLeft: 8, transform: [{ rotate: '90deg' }] },
    cardNumber: { ...TYPOGRAPHY.h3, color: COLORS.white, letterSpacing: 3 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
    cardLabel: { ...TYPOGRAPHY.small, color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
    cardValue: { ...TYPOGRAPHY.caption, color: COLORS.white, fontWeight: '600' },

    // Features
    features: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.glass,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.l,
        marginBottom: SPACING.xl,
    },
    feature: { alignItems: 'center', flex: 1 },
    featureIcon: { fontSize: 20, marginBottom: 4 },
    featureText: { ...TYPOGRAPHY.small, color: COLORS.textSecondary },
    featureDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },

    // Button
    button: { width: '100%', marginBottom: SPACING.l, ...SHADOWS.glow(COLORS.secondary) },
    buttonGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: RADIUS.full,
    },
    buttonText: { ...TYPOGRAPHY.button, color: COLORS.white, marginRight: 8 },
    buttonArrow: { fontSize: 20, color: COLORS.white },

    footer: { ...TYPOGRAPHY.small, color: COLORS.textMuted, textAlign: 'center' },
});
