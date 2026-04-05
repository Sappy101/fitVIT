import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';
const DIET_OPTIONS = ['Veg', 'Non-Veg', 'Special'];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, session, signOut, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    age: profile?.age?.toString() || '',
    height_cm: profile?.height_cm?.toString() || '',
    weight_kg: profile?.weight_kg?.toString() || '',
    diet_preference: profile?.diet_preference || 'Veg',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/profile/${session?.user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          age: form.age ? parseInt(form.age) : null,
          height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
          weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
          diet_preference: form.diet_preference,
        }),
      });
      if (res.ok) {
        await refreshProfile();
        setEditing(false);
        Alert.alert('Success', 'Profile updated!');
      } else throw new Error('Failed');
    } catch (err) { Alert.alert('Error', 'Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Avatar & Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{(profile?.full_name || 'U')[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
          <View style={styles.eliteBadge}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
            <Text style={styles.eliteText}>ELITE PERFORMANCE</Text>
          </View>
          <Text style={styles.memberSince}>Active member since {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
        </View>

        {/* Personal Info */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TouchableOpacity testID="edit-profile-button" onPress={() => setEditing(!editing)}>
              <Text style={styles.editBtn}>{editing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <ProfileField label="Full Name" value={form.full_name} editable={editing} onChangeText={v => setForm(p => ({ ...p, full_name: v }))} />
          <ProfileField label="Email" value={session?.user?.email || ''} editable={false} />
          <ProfileField label="Age" value={form.age} editable={editing} onChangeText={v => setForm(p => ({ ...p, age: v }))} keyboardType="numeric" />
          <ProfileField label="Weight (kg)" value={form.weight_kg} editable={editing} onChangeText={v => setForm(p => ({ ...p, weight_kg: v }))} keyboardType="numeric" />
          <ProfileField label="Height (cm)" value={form.height_cm} editable={editing} onChangeText={v => setForm(p => ({ ...p, height_cm: v }))} keyboardType="numeric" />
        </View>

        {/* Diet Preference */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences & Settings</Text>
          <Text style={styles.fieldLabel}>Preferred Mess</Text>
          <View style={styles.dietRow}>
            {DIET_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                testID={`diet-pref-${opt.toLowerCase()}`}
                style={[styles.dietBtn, form.diet_preference === opt && styles.dietBtnActive]}
                onPress={() => editing && setForm(p => ({ ...p, diet_preference: opt }))}
              >
                <Text style={[styles.dietBtnText, form.diet_preference === opt && styles.dietBtnTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.dietNote}>This will be your default selection when opening Meal Planner</Text>
        </View>

        {/* Actions */}
        {editing && (
          <TouchableOpacity testID="save-profile-button" style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color={COLORS.textInverse} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        )}

        <TouchableOpacity testID="sign-out-button" style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileField({ label, value, editable, onChangeText, keyboardType }: any) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      {editable ? (
        <TextInput style={fieldStyles.input} value={value} onChangeText={onChangeText} keyboardType={keyboardType || 'default'} placeholderTextColor={COLORS.textMuted} />
      ) : (
        <Text style={fieldStyles.value}>{value || '—'}</Text>
      )}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: { ...FONTS.caption, color: COLORS.textMuted, marginBottom: 4, fontSize: 11 },
  value: { ...FONTS.body, color: COLORS.textPrimary },
  input: { ...FONTS.body, color: COLORS.textPrimary, backgroundColor: COLORS.backgroundSubtle, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', paddingVertical: SPACING.xl },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  avatarText: { ...FONTS.h1, color: COLORS.textInverse },
  profileName: { ...FONTS.h2, color: COLORS.textPrimary },
  eliteBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full, marginTop: SPACING.xs },
  eliteText: { ...FONTS.caption, color: COLORS.primary, marginLeft: 4 },
  memberSince: { ...FONTS.bodySmall, color: COLORS.textMuted, marginTop: SPACING.xs },
  sectionCard: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { ...FONTS.h4, color: COLORS.textPrimary },
  editBtn: { ...FONTS.body, color: COLORS.primary, fontWeight: '700' },
  fieldLabel: { ...FONTS.caption, color: COLORS.textMuted, marginBottom: SPACING.sm, fontSize: 11 },
  dietRow: { flexDirection: 'row', gap: SPACING.sm },
  dietBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.backgroundSubtle, borderWidth: 1, borderColor: COLORS.border },
  dietBtnActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  dietBtnText: { ...FONTS.body, color: COLORS.textMuted, fontWeight: '600' },
  dietBtnTextActive: { color: COLORS.primary, fontWeight: '700' },
  dietNote: { ...FONTS.caption, color: COLORS.textMuted, marginTop: SPACING.sm, fontSize: 10 },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center', marginBottom: SPACING.md, ...SHADOWS.md },
  saveBtnText: { ...FONTS.h4, color: COLORS.textInverse },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.error + '40' },
  signOutText: { ...FONTS.body, color: COLORS.error, fontWeight: '600', marginLeft: SPACING.sm },
});
