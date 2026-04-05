import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/constants/theme';
import mockRatingsData from '../../src/data/meal_ratings_daily_rows.json';
import ProgressChart from 'react-native-chart-kit/dist/ProgressChart';

const screenWidth = Dimensions.get('window').width - SPACING.md * 2;

export default function FeedbackScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading to establish the UI rendering phase seamlessly
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Use the raw mocked ratings data locally on the edge 
  const ratings = mockRatingsData.map((r: any) => ({
    ...r,
    rating: parseInt(r.rating) || 0,
    calories: parseInt(r.calories) || 0,
    servings: parseInt(r.servings) || 1,
  }));

  // Group by date
  const grouped: Record<string, typeof ratings> = {};
  let totalRatingSum = 0;
  let excellentCount = 0;
  let poorCount = 0;

  for (const r of ratings) {
    if (r.rating >= 4) excellentCount++;
    if (r.rating <= 2) poorCount++;
    totalRatingSum += r.rating;

    const key = r.log_date;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  }

  const sortedDates = Object.keys(grouped).sort().reverse();
  const avgRating = ratings.length > 0 ? (totalRatingSum / ratings.length).toFixed(1) : "0.0";
  const excellentRatio = ratings.length > 0 ? excellentCount / ratings.length : 0;
  const poorRatio = ratings.length > 0 ? poorCount / ratings.length : 0;

  const chartData = {
    labels: ["Excellent (4-5⭐)", "Poor (1-2⭐)"], // optional
    data: [excellentRatio, poorRatio]
  };

  const chartConfig = {
    backgroundGradientFrom: COLORS.cardBg,
    backgroundGradientTo: COLORS.cardBg,
    color: (opacity = 1, index) => {
      if (index === 0) return `rgba(76, 175, 80, ${opacity})`; // Green for excellent
      if (index === 1) return `rgba(244, 67, 54, ${opacity})`; // Red for poor
      return `rgba(33, 150, 243, ${opacity})`; // Fallback Blue
    },
    strokeWidth: 12, // optional, default 3
    barPercentage: 0.5,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.overline}>COMMUNITY PULSE</Text>
            <Text style={styles.title}>Student Feedback</Text>
          </View>
          <View style={styles.adminBadge}>
            <Ionicons name="chatbubbles" size={16} color={COLORS.textInverse} />
          </View>
        </View>

        {/* Sentinel Info Cards */}
        <View style={styles.sentimentCard}>
            <View style={styles.sentimentHeader}>
                <Ionicons name="hardware-chip-outline" size={18} color={COLORS.primary} />
                <Text style={styles.sentimentTitle}>Sentiment Overview</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <ProgressChart
                    data={chartData}
                    width={screenWidth / 2}
                    height={120}
                    strokeWidth={12}
                    radius={24}
                    chartConfig={chartConfig}
                    hideLegend={true}
                    style={{marginLeft: -20}}
                />
                <View style={{flex: 1}}>
                    <View style={styles.legendRow}>
                        <View style={[styles.dot, {backgroundColor: COLORS.success}]} />
                        <Text style={styles.legendText}>⭐ 4-5 ({Math.round(excellentRatio * 100)}%)</Text>
                    </View>
                    <View style={styles.legendRow}>
                        <View style={[styles.dot, {backgroundColor: COLORS.error}]} />
                        <Text style={styles.legendText}>⭐ 1-2 ({Math.round(poorRatio * 100)}%)</Text>
                    </View>
                    <View style={{marginTop: 10}}>
                        <Text style={styles.avgText}>{avgRating} / 5.0</Text>
                        <Text style={styles.avgSubText}>Global Node Average</Text>
                    </View>
                </View>
            </View>
        </View>

        <Text style={styles.sectionTitle}>Live Activity Feed</Text>

        {sortedDates.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubbles-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No feedback yet</Text>
          </View>
        ) : (
          sortedDates.map(date => (
            <View key={date} style={styles.dateGroup}>
              <View style={styles.dateChip}>
                <Text style={styles.dateLabel}>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
              </View>
              {grouped[date].map((r: any) => (
                <View key={r.id} style={styles.feedbackCard}>
                  <View style={styles.fbLeftLine} />
                  <View style={styles.fbHeader}>
                    <View style={styles.fbAvatar}>
                      <Text style={styles.fbAvatarText}>{(r.email || '?')[0].toUpperCase()}</Text>
                    </View>
                    <View style={styles.fbInfo}>
                      <Text style={styles.fbEmail} numberOfLines={1}>{r.email}</Text>
                      <Text style={styles.fbMeta}>{r.slot} · {r.diet_type}</Text>
                    </View>
                    <View style={styles.fbStars}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Ionicons key={s} name={s <= r.rating ? 'star' : 'star-outline'} size={14} color={s <= r.rating ? COLORS.star : COLORS.border} />
                      ))}
                    </View>
                  </View>
                  <View style={styles.fbBody}>
                    <Text style={styles.fbItem}>{r.item_name}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  overline: { ...FONTS.overline, color: COLORS.primary },
  title: { ...FONTS.h2, color: COLORS.textPrimary },
  adminBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  sentimentCard: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.md },
  sentimentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  sentimentTitle: { ...FONTS.h4, color: COLORS.textPrimary, marginLeft: SPACING.xs },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { ...FONTS.bodySmall, color: COLORS.textSecondary },
  avgText: { ...FONTS.h2, color: COLORS.textPrimary, lineHeight: 28 },
  avgSubText: { ...FONTS.caption, color: COLORS.textMuted, fontSize: 10 },
  sectionTitle: { ...FONTS.h3, color: COLORS.textPrimary, marginBottom: SPACING.md },
  dateGroup: { marginBottom: SPACING.lg },
  dateChip: { backgroundColor: COLORS.backgroundMuted, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full, marginBottom: SPACING.sm },
  dateLabel: { ...FONTS.caption, color: COLORS.textSecondary, fontWeight: '700' },
  feedbackCard: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md, padding: SPACING.sm, paddingLeft: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  fbLeftLine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: COLORS.primaryLight },
  fbHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  fbAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  fbAvatarText: { ...FONTS.caption, color: COLORS.primary, fontSize: 12, fontWeight: '800' },
  fbInfo: { flex: 1, marginLeft: SPACING.sm },
  fbEmail: { ...FONTS.bodySmall, color: COLORS.textPrimary, fontWeight: '600' },
  fbMeta: { ...FONTS.caption, color: COLORS.textMuted, fontSize: 10 },
  fbStars: { flexDirection: 'row' },
  fbBody: { marginLeft: 40, marginTop: 4 },
  fbItem: { ...FONTS.body, color: COLORS.textSecondary, fontStyle: 'italic' },
  emptyBox: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { ...FONTS.body, color: COLORS.textMuted, marginTop: SPACING.sm },
});
