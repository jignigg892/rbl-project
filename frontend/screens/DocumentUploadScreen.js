import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, GLASS_CARD } from '../constants/Theme';

const DOCS = [
    { id: 'bank_statement', name: 'Bank Statement', icon: '🏦', desc: 'Last 3 months' },
    { id: 'salary_slip', name: 'Salary Slip', icon: '💰', desc: 'Latest month' },
    { id: 'itr', name: 'ITR Filing', icon: '📊', desc: 'Last financial year' },
];

export default function DocumentUploadScreen({ route, navigation }) {
    const [uploads, setUploads] = useState({});
    const [uploading, setUploading] = useState(null);

    const mockUpload = (id) => {
        setUploading(id);
        setTimeout(() => { setUploads({ ...uploads, [id]: true }); setUploading(null); }, 1500);
    };

    const handleSubmit = () => {
        if (Object.keys(uploads).length === 0) { Alert.alert('Required', 'Upload at least one document.'); return; }
        navigation.navigate('Submission', { ...route.params, documents: uploads });
    };

    return (
        <LinearGradient colors={COLORS.gradientPrimary} style={s.container}>
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <Text style={s.title}>Upload Documents</Text>
                <Text style={s.subtitle}>Supporting documents for verification.</Text>

                {DOCS.map((doc) => (
                    <View key={doc.id} style={[s.card, uploads[doc.id] && s.cardDone]}>
                        <View style={s.row}>
                            <Text style={{ fontSize: 24 }}>{doc.icon}</Text>
                            <View style={{ flex: 1, marginLeft: SPACING.m }}>
                                <Text style={s.docName}>{doc.name}</Text>
                                <Text style={s.docDesc}>{doc.desc}</Text>
                            </View>
                            {uploads[doc.id] && <Text style={{ color: COLORS.success, fontSize: 20 }}>✓</Text>}
                            {uploading === doc.id && <ActivityIndicator color={COLORS.accent} />}
                        </View>
                        {!uploads[doc.id] && (
                            <TouchableOpacity style={s.uploadBtn} onPress={() => mockUpload(doc.id)} disabled={!!uploading}>
                                <Text style={s.uploadText}>📎 TAP TO UPLOAD</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85}>
                    <LinearGradient colors={COLORS.gradientRed} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.button}>
                        <Text style={s.buttonText}>SUBMIT APPLICATION →</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: SPACING.l, paddingBottom: SPACING.xxxl },
    title: { ...TYPOGRAPHY.h1, color: COLORS.white, marginBottom: SPACING.xs },
    subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },
    card: { ...GLASS_CARD, padding: SPACING.l, marginBottom: SPACING.m },
    cardDone: { borderColor: 'rgba(0,196,140,0.3)' },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.m },
    docName: { ...TYPOGRAPHY.bodyBold, color: COLORS.white },
    docDesc: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
    uploadBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', borderRadius: RADIUS.m, padding: SPACING.m, alignItems: 'center' },
    uploadText: { ...TYPOGRAPHY.caption, color: COLORS.accent, fontWeight: '600' },
    button: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18, borderRadius: RADIUS.full, ...SHADOWS.glow(COLORS.secondary), marginTop: SPACING.l },
    buttonText: { ...TYPOGRAPHY.button, color: COLORS.white },
});
