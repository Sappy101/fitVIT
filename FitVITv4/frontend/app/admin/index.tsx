import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/constants/theme';
import { generateAdminAnalytics, AnalyticsModel } from '../../src/lib/predictiveEngine';
import PieChart from 'react-native-chart-kit/dist/PieChart';
import BarChart from 'react-native-chart-kit/dist/BarChart';

const screenWidth = Dimensions.get('window').width - SPACING.md * 2;

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [errorStr, setErrorStr] = useState('');

  const loadData = () => {
    try {
      const data = generateAdminAnalytics();
      setAnalytics(data);
    } catch (e: any) {
      console.warn("Analytics Engine Failed: ", e);
      setErrorStr(e.toString());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (errorStr) {
    return <SafeAreaView style={styles.safe}><View style={styles.center}><Text>Error: {errorStr}</Text></View></SafeAreaView>;
  }

  if (loading || !analytics) {
    return <SafeAreaView style={styles.safe}><View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View></SafeAreaView>;
  }

  const s = analytics.summary;
  const topDemand = analytics.demand_items.slice(0, 5);
  
  // Clean names for bar chart X axis
  const barData = {
    labels: topDemand.map(x => {
      const parts = x.item_name.split(' ');
      return parts[0].substring(0, 8);
    }),
    datasets: [{
      data: topDemand.map(x => x.demand_score)
    }]
  };

  const chartConfig = {
    backgroundGradientFrom: COLORS.cardBg,
    backgroundGradientTo: COLORS.cardBg,
    color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`, // primary color
    strokeWidth: 2, 
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.overline}>SMART MESS INTELLIGENCE</Text>
            <Text style={styles.title}>Data & Insights</Text>
          </View>
          <View style={styles.adminBadge}>
            <Ionicons name="analytics" size={16} color={COLORS.textInverse} />
          </View>
        </View>

        {/* High-Level Metrics */}
        <View style={styles.statsGrid}>
          <StatCard icon="restaurant" label="Menu Items" value={s.total_menu_items} color={COLORS.primary} />
          <StatCard icon="star" label="Total Ratings" value={s.total_ratings} color={COLORS.star} />
          <StatCard icon="trending-up" label="Avg Rating" value={s.avg_overall_rating} color={COLORS.success} suffix="/5" />
          <StatCard icon="alert-circle" label="High Waste Risk" value={s.high_waste_risk} color={COLORS.error} />
        </View>

        {/* AI Recommendations */}
        <Text style={styles.sectionTitle}>System Intelligence</Text>
        {analytics.recommendations.map((rec, i) => (
          <View key={i} style={styles.recCard}>
            <Ionicons name={rec.includes('Warning') ? 'warning' : 'bulb'} size={18} color={rec.includes('Warning') ? COLORS.warning : COLORS.success} />
            <Text style={styles.recText}>{rec}</Text>
          </View>
        ))}

        {/* Machine Learning Trend Bar Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Top Predicted Favorites (Demand Score)</Text>
          {topDemand.length > 0 ? (
            <BarChart
              data={barData}
              width={screenWidth - 20}
              height={220}
              yAxisLabel=""
              yAxisSuffix="%"
              chartConfig={chartConfig}
              style={{ marginVertical: 8, borderRadius: 8 }}
              showValuesOnTopOfBars
            />
          ) : (
            <Text style={styles.emptyText}>Not enough data to calculate trends</Text>
          )}
        </View>

        {/* Dietary Demographics Pie Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Vault Dietary Demographic</Text>
          <PieChart
            data={analytics.dietDistribution}
            width={screenWidth - 20}
            height={200}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        </View>

        {/* Full Leaderboard */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Detailed Leaderboard</Text>
        {analytics.demand_items.slice(0, 10).map((item, i) => (
          <View key={i} style={styles.demandCard}>
            <View style={styles.demandRank}>
              <Text style={styles.rankNum}>#{i + 1}</Text>
            </View>
            <View style={styles.demandInfo}>
              <Text style={styles.demandName} numberOfLines={1}>{item.item_name}</Text>
              <View style={styles.demandMeta}>
                <Text style={styles.metaText}>⭐ {item.avg_rating}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaText}>👍 {item.pref_likes} 👎 {item.pref_dislikes}</Text>
              </View>
            </View>
            <View style={styles.demandRight}>
              <Text style={styles.demandScore}>{item.demand_score}%</Text>
              <View style={[styles.riskBadge, { backgroundColor: item.waste_risk === 'HIGH' ? COLORS.error + '20' : item.waste_risk === 'MEDIUM' ? COLORS.warning + '20' : COLORS.success + '20' }]}>
                <Text style={[styles.riskText, { color: item.waste_risk === 'HIGH' ? COLORS.error : item.waste_risk === 'MEDIUM' ? COLORS.warning : COLORS.success }]}>
                  {item.waste_risk === 'HIGH' ? 'HIGH RISK' : item.waste_risk === 'MEDIUM' ? 'WATCH' : 'SAFE'}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  overline: { ...FONTS.overline, color: COLORS.primary },
  title: { ...FONTS.h2, color: COLORS.textPrimary },
  adminBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: SPACING.sm },
  sectionTitle: { ...FONTS.h3, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  recCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm },
  recText: { ...FONTS.bodySmall, color: COLORS.textPrimary, marginLeft: SPACING.sm, flex: 1, fontWeight: '500' },
  chartCard: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  chartTitle: { ...FONTS.h4, color: COLORS.textPrimary, marginBottom: SPACING.sm, textAlign: 'center' },
  emptyText: { ...FONTS.body, color: COLORS.textMuted, textAlign: 'center', paddingVertical: SPACING.lg },
  demandCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  demandRank: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.backgroundMuted, alignItems: 'center', justifyContent: 'center' },
  rankNum: { ...FONTS.bodySmall, color: COLORS.primary, fontWeight: '800' },
  demandInfo: { flex: 1, marginLeft: SPACING.sm },
  demandName: { ...FONTS.body, color: COLORS.textPrimary, fontWeight: '600' },
  demandMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  metaText: { ...FONTS.caption, color: COLORS.textMuted, fontSize: 10 },
  metaDot: { ...FONTS.caption, color: COLORS.border, marginHorizontal: 4, fontSize: 10 },
  demandRight: { alignItems: 'flex-end' },
  demandScore: { ...FONTS.h4, color: COLORS.primary },
  riskBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full, marginTop: 2 },
  riskText: { ...FONTS.caption, fontSize: 8 },
});
