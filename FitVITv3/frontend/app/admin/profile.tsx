import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS } from '../../src/constants/theme';

export default function AdminProfileScreen() {
  const router = useRouter();
  const { profile, session, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="shield-checkmark" size={36} color={COLORS.textInverse} />
          </View>
          <Text style={styles.profileName}>{profile?.full_name || 'Admin'}</Text>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>MESS ADMINISTRATOR</Text>
          </View>
          <Text style={styles.email}>{session?.user?.email || ''}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Admin Settings</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>Administrator</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{session?.user?.email || '—'}</Text>
          </View>
        </View>

        <TouchableOpacity testID="switch-to-student-view" style={styles.switchBtn} onPress={() => router.replace('/student')}>
          <Ionicons name="swap-horizontal-outline" size={20} color={COLORS.primary} />
          <Text style={styles.switchText}>Switch to Student View</Text>
        </TouchableOpacity>

        <TouchableOpacity testID="admin-sign-out-button" style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', paddingVertical: SPACING.xl },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.darkCard, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  profileName: { ...FONTS.h2, color: COLORS.textPrimary },
  adminBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full, marginTop: SPACING.xs },
  adminBadgeText: { ...FONTS.caption, color: COLORS.primary },
  email: { ...FONTS.bodySmall, color: COLORS.textMuted, marginTop: SPACING.xs },
  infoCard: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { ...FONTS.h4, color: COLORS.textPrimary, marginBottom: SPACING.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  infoLabel: { ...FONTS.body, color: COLORS.textMuted, marginLeft: SPACING.sm, flex: 1 },
  infoValue: { ...FONTS.body, color: COLORS.textPrimary, fontWeight: '600' },
  switchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: RADIUS.md, backgroundColor: COLORS.primaryLight, marginBottom: SPACING.md },
  switchText: { ...FONTS.body, color: COLORS.primary, fontWeight: '700', marginLeft: SPACING.sm },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.error + '40' },
  signOutText: { ...FONTS.body, color: COLORS.error, fontWeight: '600', marginLeft: SPACING.sm },
});
