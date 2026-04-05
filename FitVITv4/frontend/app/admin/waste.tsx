import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/constants/theme';
import { getWasteAnalytics, WasteAnalytics } from '../../src/lib/wasteEngine';
import BarChart from 'react-native-chart-kit/dist/BarChart';
import PieChart from 'react-native-chart-kit/dist/PieChart';

const screenWidth = Dimensions.get('window').width - SPACING.md * 2;

export default function WasteScreen() {
  const [data, setData] = useState<WasteAnalytics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const analytics = getWasteAnalytics();
      setData(analytics);
    } catch (e: any) {
      setError(e.toString());
    }
  }, []);

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Ionicons name="warning" size={40} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Stacked bar chart data
  const stackedBarData = {
    labels: data.dailyData.map(d => d.day),
    datasets: [
      { data: data.dailyData.map(d => d.wet_kg) },
      { data: data.dailyData.map(d => d.dry_kg) },
      { data: data.dailyData.map(d => d.bones_kg) },
    ],
  };

  const barChartData = {
    labels: data.dailyData.map(d => d.day),
    datasets: [{ data: data.dailyData.map(d => d.total_kg) }],
  };

  const chartConfig = {
    backgroundGradientFrom: COLORS.cardBg,
    backgroundGradientTo: COLORS.cardBg,
    color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.55,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: () => COLORS.textMuted,
    propsForLabels: { fontSize: 10 },
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.overline}>ECO CAMPUS INITIATIVE</Text>
            <Text style={styles.title}>Waste Management</Text>
          </View>
          <View style={styles.adminBadge}>
            <Ionicons name="leaf" size={16} color={COLORS.textInverse} />
          </View>
        </View>

        {/* KPI Summary */}
        <View style={styles.statsGrid}>
          <KPICard icon="scale-outline" label="7-Day Total" value={`${data.totals.total} kg`} color={COLORS.primary} />
          <KPICard icon="today-outline" label="Daily Avg" value={`${data.averages.total} kg`} color={COLORS.info} />
          <KPICard icon="trending-up" label="Peak Day" value={data.peakDay.day} color={COLORS.error} subtitle={`${data.peakDay.total} kg`} />
          <KPICard icon="refresh-outline" label="Recyclable" value={`${data.recycling.total_recyclable_pct}%`} color={COLORS.success} />
        </View>

        {/* Daily Waste Bar Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="bar-chart-outline" size={18} color={COLORS.primary} />
            <Text style={styles.chartTitle}>Daily Waste Output (kg)</Text>
          </View>
          <BarChart
            data={barChartData}
            width={screenWidth - 24}
            height={220}
            yAxisLabel=""
            yAxisSuffix=" kg"
            chartConfig={chartConfig}
            style={{ marginVertical: 8, borderRadius: 8 }}
            showValuesOnTopOfBars
          />
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.legendLabel}>Wet</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.legendLabel}>Dry</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendLabel}>Bones</Text>
            </View>
          </View>
        </View>

        {/* Waste Composition Pie Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="pie-chart-outline" size={18} color={COLORS.primary} />
            <Text style={styles.chartTitle}>Waste Composition</Text>
          </View>
          <PieChart
            data={data.categoryBreakdown}
            width={screenWidth - 24}
            height={200}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        </View>

        {/* Smart Insights */}
        <Text style={styles.sectionTitle}>Smart Insights</Text>
        {data.insights.map((insight, i) => (
          <View key={i} style={styles.insightCard}>
            <View style={styles.insightLine} />
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}

        {/* Recycling Channels */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Recycling Channels</Text>

        <View style={styles.recycleCard}>
          <View style={[styles.recycleIcon, { backgroundColor: '#FF980020' }]}>
            <Ionicons name="leaf-outline" size={22} color="#FF9800" />
          </View>
          <View style={styles.recycleInfo}>
            <Text style={styles.recycleTitle}>Dry Waste → Soil Manure</Text>
            <Text style={styles.recycleDesc}>Onion shells, vegetable peels, and other dry waste can be sun-dried and converted into organic soil manure for the campus garden.</Text>
          </View>
          <View style={styles.recycleKg}>
            <Text style={styles.recycleValue}>{data.recycling.manure_potential_kg}</Text>
            <Text style={styles.recycleUnit}>kg</Text>
          </View>
        </View>

        <View style={styles.recycleCard}>
          <View style={[styles.recycleIcon, { backgroundColor: '#F4433620' }]}>
            <Ionicons name="paw-outline" size={22} color="#F44336" />
          </View>
          <View style={styles.recycleInfo}>
            <Text style={styles.recycleTitle}>Bones → Pet Shelters</Text>
            <Text style={styles.recycleDesc}>Chicken and fish bones can be supplied to local veterinary clinics and pet shelters, or fed directly to stray dogs on campus.</Text>
          </View>
          <View style={styles.recycleKg}>
            <Text style={styles.recycleValue}>{data.recycling.pet_shelter_kg}</Text>
            <Text style={styles.recycleUnit}>kg</Text>
          </View>
        </View>

        <View style={styles.recycleCard}>
          <View style={[styles.recycleIcon, { backgroundColor: '#2196F320' }]}>
            <Ionicons name="water-outline" size={22} color="#2196F3" />
          </View>
          <View style={styles.recycleInfo}>
            <Text style={styles.recycleTitle}>Wet Waste → Composting</Text>
            <Text style={styles.recycleDesc}>Student food leftovers can be processed through the in-house composting unit to generate nutrient-rich compost for the college grounds.</Text>
          </View>
          <View style={styles.recycleKg}>
            <Text style={styles.recycleValue}>{data.recycling.compost_kg}</Text>
            <Text style={styles.recycleUnit}>kg</Text>
          </View>
        </View>

        {/* Daily Breakdown Table */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>7-Day Breakdown</Text>
        <View style={styles.tableCard}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHead, { flex: 1.3 }]}>Day</Text>
            <Text style={styles.tableHead}>🦴 Bones</Text>
            <Text style={styles.tableHead}>🥬 Dry</Text>
            <Text style={styles.tableHead}>🍲 Wet</Text>
            <Text style={[styles.tableHead, { fontWeight: '800' }]}>Total</Text>
          </View>
          {data.dailyData.map((row, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : {}]}>
              <Text style={[styles.tableCell, { flex: 1.3, fontWeight: '600' }]}>{row.day}</Text>
              <Text style={styles.tableCell}>{row.bones_kg}</Text>
              <Text style={styles.tableCell}>{row.dry_kg}</Text>
              <Text style={styles.tableCell}>{row.wet_kg}</Text>
              <Text style={[styles.tableCell, { fontWeight: '700', color: COLORS.textPrimary }]}>{row.total_kg}</Text>
            </View>
          ))}
          {/* Averages row */}
          <View style={[styles.tableRow, styles.tableAvgRow]}>
            <Text style={[styles.tableCell, { flex: 1.3, fontWeight: '800', color: COLORS.primary }]}>AVG</Text>
            <Text style={[styles.tableCell, { color: COLORS.primary }]}>{data.averages.bones}</Text>
            <Text style={[styles.tableCell, { color: COLORS.primary }]}>{data.averages.dry}</Text>
            <Text style={[styles.tableCell, { color: COLORS.primary }]}>{data.averages.wet}</Text>
            <Text style={[styles.tableCell, { fontWeight: '800', color: COLORS.primary }]}>{data.averages.total}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Sub-components ---

function KPICard({ icon, label, value, color, subtitle }: { icon: any; label: string; value: string; color: string; subtitle?: string }) {
  return (
    <View style={kpiStyles.card}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={kpiStyles.value}>{value}</Text>
      {subtitle ? <Text style={kpiStyles.subtitle}>{subtitle}</Text> : null}
      <Text style={kpiStyles.label}>{label}</Text>
    </View>
  );
}

const kpiStyles = StyleSheet.create({
  card: { width: '48%', backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  value: { ...FONTS.h3, color: COLORS.textPrimary, marginTop: SPACING.xs },
  subtitle: { ...FONTS.caption, color: COLORS.textMuted, fontSize: 10 },
  label: { ...FONTS.caption, color: COLORS.textMuted, fontSize: 10, marginTop: 2 },
});

// --- Main Styles ---

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  errorText: { ...FONTS.body, color: COLORS.error, marginTop: SPACING.sm, textAlign: 'center' },
  scroll: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: 100 },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  overline: { ...FONTS.overline, color: COLORS.primary },
  title: { ...FONTS.h2, color: COLORS.textPrimary },
  adminBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },

  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: SPACING.sm },

  // Chart Card
  chartCard: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  chartHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  chartTitle: { ...FONTS.h4, color: COLORS.textPrimary, marginLeft: SPACING.xs },
  chartLegend: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  legendLabel: { ...FONTS.caption, color: COLORS.textMuted, fontSize: 10 },

  // Section Title
  sectionTitle: { ...FONTS.h3, color: COLORS.textPrimary, marginBottom: SPACING.sm },

  // Insight Cards
  insightCard: { backgroundColor: COLORS.backgroundSubtle, borderRadius: RADIUS.md, padding: SPACING.sm, paddingLeft: SPACING.md, marginBottom: SPACING.sm, overflow: 'hidden' },
  insightLine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: COLORS.primary },
  insightText: { ...FONTS.bodySmall, color: COLORS.textSecondary, lineHeight: 20 },

  // Recycling Cards
  recycleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  recycleIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  recycleInfo: { flex: 1, marginLeft: SPACING.sm },
  recycleTitle: { ...FONTS.body, color: COLORS.textPrimary, fontWeight: '700' },
  recycleDesc: { ...FONTS.caption, color: COLORS.textMuted, fontSize: 10, marginTop: 2, lineHeight: 14 },
  recycleKg: { alignItems: 'center', marginLeft: SPACING.sm },
  recycleValue: { ...FONTS.h3, color: COLORS.primary },
  recycleUnit: { ...FONTS.caption, color: COLORS.textMuted, fontSize: 9 },

  // Table
  tableCard: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  tableHeaderRow: { flexDirection: 'row', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.sm, backgroundColor: COLORS.primary + '10' },
  tableHead: { flex: 1, ...FONTS.caption, color: COLORS.primary, fontSize: 10, textAlign: 'center' },
  tableRow: { flexDirection: 'row', paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  tableRowEven: { backgroundColor: COLORS.backgroundSubtle },
  tableAvgRow: { backgroundColor: COLORS.primaryLight, borderTopWidth: 2, borderTopColor: COLORS.primary },
  tableCell: { flex: 1, ...FONTS.bodySmall, color: COLORS.textSecondary, textAlign: 'center', fontSize: 12 },
});
