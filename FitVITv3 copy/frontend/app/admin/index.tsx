import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface Analytics {
  summary: {
    total_menu_items: number;
    rated_items: number;
    total_ratings: number;
    avg_overall_rating: number;
    high_waste_risk: number;
    medium_waste_risk: number;
  };
  demand_items: Array<{
    item_name: string;
    avg_rating: number;
    total_ratings: number;
    pref_likes: number;
    pref_dislikes: number;
    demand_score: number;
    waste_risk: string;
  }>;
  recommendations: string[];
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setError('');
      const res = await fetch(`${BACKEND_URL}/api/analytics`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      setAnalytics(await res.json());
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (loading) {
    return <SafeAreaView style={styles.safe}><View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View></SafeAreaView>;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const s = analytics?.summary;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAnalytics(); }} tintColor={COLORS.primary} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.overline}>SMART MESS ADMIN</Text>
            <Text style={styles.title}>Analytics Dashboard</Text>
          </View>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.textInverse} />
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.statsGrid}>
          <StatCard icon="restaurant" label="Menu Items" value={s?.total_menu_items || 0} color={COLORS.primary} />
          <StatCard icon="star" label="Total Ratings" value={s?.total_ratings || 0} color={COLORS.star} />
          <StatCard icon="trending-up" label="Avg Rating" value={s?.avg_overall_rating || 0} color={COLORS.success} suffix="/5" />
          <StatCard icon="alert-circle" label="High Waste Risk" value={s?.high_waste_risk || 0} color={COLORS.error} />
        </View>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>Recommendations</Text>
        {analytics?.recommendations?.length ? (
          analytics.recommendations.map((rec, i) => (
            <View key={i} style={styles.recCard}>
              <Ionicons name={rec.includes('Keep') ? 'checkmark-circle' : 'warning'} size={18} color={rec.includes('Keep') ? COLORS.success : COLORS.warning} />
              <Text style={styles.recText}>{rec}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recommendations yet</Text>
        )}

        {/* Top Demand Items */}
        <Text style={styles.sectionTitle}>Demand Leaderboard</Text>
        {analytics?.demand_items?.slice(0, 15).map((item, i) => (
          <View key={i} style={styles.demandCard}>
            <View style={styles.demandRank}>
              <Text style={styles.rankNum}>#{i + 1}</Text>
            </View>
            <View style={styles.demandInfo}>
              <Text style={styles.demandName} numberOfLines={1}>{item.item_name}</Text>
              <View style={styles.demandMeta}>
                <Text style={styles.metaText}>⭐ {item.avg_rating}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaText}>{item.total_ratings} ratings</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaText}>👍 {item.pref_likes} 👎 {item.pref_dislikes}</Text>
              </View>
            </View>
            <View style={styles.demandRight}>
              <Text style={styles.demandScore}>{item.demand_score}</Text>
              <View style={[styles.riskBadge, { backgroundColor: item.waste_risk === 'HIGH' ? COLORS.error + '20' : item.waste_risk === 'MEDIUM' ? COLORS.warning + '20' : COLORS.success + '20' }]}>
                <Text style={[styles.riskText, { color: item.waste_risk === 'HIGH' ? COLORS.error : item.waste_risk === 'MEDIUM' ? COLORS.warning : COLORS.success }]}>
                  {item.waste_risk}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color, suffix }: { icon: any; label: string; value: number; color: string; suffix?: string }) {
  return (
    <View style={statStyles.card}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={statStyles.value}>{value}{suffix || ''}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: { width: '48%', backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  value: { ...FONTS.h2, color: COLORS.textPrimary, marginTop: SPACING.xs },
  label: { ...FONTS.caption, color: COLORS.textMuted, fontSize: 10, marginTop: 2 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  scroll: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  overline: { ...FONTS.overline, color: COLORS.primary },
  title: { ...FONTS.h2, color: COLORS.textPrimary },
  adminBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: SPACING.lg },
  sectionTitle: { ...FONTS.h3, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  recCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundSubtle, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm },
  recText: { ...FONTS.bodySmall, color: COLORS.textSecondary, marginLeft: SPACING.sm, flex: 1 },
  emptyText: { ...FONTS.body, color: COLORS.textMuted, textAlign: 'center', paddingVertical: SPACING.lg },
  errorText: { ...FONTS.body, color: COLORS.error, marginTop: SPACING.sm, textAlign: 'center' },
  demandCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  demandRank: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.backgroundMuted, alignItems: 'center', justifyContent: 'center' },
  rankNum: { ...FONTS.bodySmall, color: COLORS.primary, fontWeight: '800' },
  demandInfo: { flex: 1, marginLeft: SPACING.sm },
  demandName: { ...FONTS.body, color: COLORS.textPrimary, fontWeight: '600' },
  demandMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  metaText: { ...FONTS.caption, color: COLORS.textMuted, fontSize: 10 },
  metaDot: { ...FONTS.caption, color: COLORS.border, marginHorizontal: 4, fontSize: 10 },
  demandRight: { alignItems: 'flex-end' },
  demandScore: { ...FONTS.h4, color: COLORS.textPrimary },
  riskBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full, marginTop: 2 },
  riskText: { ...FONTS.caption, fontSize: 8 },
});
