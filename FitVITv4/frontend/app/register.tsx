import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../src/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Account Created!</Text>
          <Text style={styles.successText}>Please check your email to verify your account, then sign in.</Text>
          <TouchableOpacity testID="go-to-login-after-register" style={styles.loginBtn} onPress={() => router.replace('/')}>
            <Text style={styles.loginBtnText}>Go to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity testID="register-back-button" onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.logoBadge}>
              <Ionicons name="leaf" size={16} color={COLORS.textInverse} />
              <Text style={styles.logoText}>FitVit</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the High-Performance Community</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput testID="register-name-input" style={styles.input} placeholder="Enter your name" placeholderTextColor={COLORS.textMuted} value={fullName} onChangeText={setFullName} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>University Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput testID="register-email-input" style={styles.input} placeholder="student@university.edu" placeholderTextColor={COLORS.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput testID="register-password-input" style={styles.input} placeholder="Min 6 characters" placeholderTextColor={COLORS.textMuted} value={password} onChangeText={setPassword} secureTextEntry />
              </View>
            </View>

            <TouchableOpacity testID="register-submit-button" style={[styles.loginBtn, loading && styles.loginBtnDisabled]} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
              {loading ? <ActivityIndicator color={COLORS.textInverse} /> : <Text style={styles.loginBtnText}>Create Account</Text>}
            </TouchableOpacity>

            <TouchableOpacity testID="go-to-login-link" style={styles.registerLink} onPress={() => router.back()}>
              <Text style={styles.registerLinkText}>Already have an account? <Text style={styles.registerLinkBold}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md },
  backBtn: { padding: SPACING.xs },
  logoBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full },
  logoText: { ...FONTS.body, color: COLORS.textInverse, fontWeight: '700', marginLeft: 4 },
  formContainer: { padding: SPACING.lg, flex: 1 },
  title: { ...FONTS.h1, color: COLORS.textPrimary, marginBottom: 4 },
  subtitle: { ...FONTS.body, color: COLORS.textMuted, marginBottom: SPACING.xl },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: SPACING.sm, borderRadius: RADIUS.sm, marginBottom: SPACING.md },
  errorText: { ...FONTS.bodySmall, color: COLORS.error, marginLeft: SPACING.xs },
  inputGroup: { marginBottom: SPACING.md },
  inputLabel: { ...FONTS.bodySmall, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSubtle, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.sm },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, paddingVertical: 14, ...FONTS.body, color: COLORS.textPrimary },
  loginBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center', marginTop: SPACING.md, ...SHADOWS.md },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { ...FONTS.h4, color: COLORS.textInverse },
  registerLink: { alignItems: 'center', marginTop: SPACING.lg },
  registerLinkText: { ...FONTS.body, color: COLORS.textMuted },
  registerLinkBold: { color: COLORS.primary, fontWeight: '700' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  successIcon: { marginBottom: SPACING.lg },
  successTitle: { ...FONTS.h2, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  successText: { ...FONTS.body, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.xl },
});
