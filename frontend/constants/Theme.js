// Premium Design System — "Pro Max" Theme
// All design tokens for the credit card app V2

export const COLORS = {
    // Primary palette
    primary: '#0A1628',       // Deep midnight navy
    primaryLight: '#162240',  // Slightly lighter navy
    secondary: '#E31837',     // RBL Red
    accent: '#C9A84C',        // Premium gold
    accentLight: '#E8D5A3',   // Light gold

    // Surfaces
    background: '#0D1B2A',    // Dark background
    surface: '#1B2838',       // Card/surface color
    surfaceLight: '#243447',  // Elevated surface
    glass: 'rgba(255,255,255,0.08)',  // Glassmorphism
    glassBorder: 'rgba(255,255,255,0.15)',

    // Text
    white: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: '#8B9CB6',
    textMuted: '#5A6C85',

    // Status
    success: '#00C48C',
    error: '#FF4757',
    warning: '#FFB830',
    info: '#3498DB',

    // Gradients
    gradientPrimary: ['#0A1628', '#162240', '#1B2838'],
    gradientAccent: ['#C9A84C', '#E8D5A3'],
    gradientCard: ['#1e3c72', '#2a5298', '#3a6bc5'],
    gradientRed: ['#E31837', '#FF4757'],
    gradientSuccess: ['#00C48C', '#00E5A0'],
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
};

export const RADIUS = {
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    full: 999,
};

export const TYPOGRAPHY = {
    hero: { fontSize: 36, fontWeight: '800', letterSpacing: -0.5 },
    h1: { fontSize: 28, fontWeight: '700', letterSpacing: -0.3 },
    h2: { fontSize: 22, fontWeight: '700' },
    h3: { fontSize: 18, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    bodyBold: { fontSize: 16, fontWeight: '600' },
    caption: { fontSize: 13, fontWeight: '400' },
    small: { fontSize: 11, fontWeight: '500', letterSpacing: 0.5 },
    button: { fontSize: 16, fontWeight: '700', letterSpacing: 1.5 },
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    glow: (color) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    }),
};

// Glassmorphism card style
export const GLASS_CARD = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.l,
    backdropFilter: 'blur(10px)', // Web only
};

// Shared component styles
export const COMPONENTS = {
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        fontSize: 16,
        color: COLORS.white,
    },
    inputFocused: {
        borderColor: COLORS.accent,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    primaryButton: {
        backgroundColor: COLORS.secondary,
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.full,
        alignItems: 'center',
    },
    primaryButtonText: {
        ...TYPOGRAPHY.button,
        color: COLORS.white,
    },
    screenContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.l,
        paddingBottom: SPACING.xxxl,
    },
};
