import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface Rating {
  id: string; email: string; log_date: string; diet_type: string; slot: string;
  item_name: string; servings: number; rating: number; calories: number;
}

export default function FeedbackScreen() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRatings = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/all-ratings`);
      setRatings(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchRatings(); }, [fetchRatings]);

  // Group by date
  const grouped: Record<string, Rating[]> = {};
  for (const r of ratings) {
    const key = r.log_date;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  }
  const sortedDates = Object.keys(grouped).sort().reverse();

  if (loading) {
    return <SafeAreaView style={styles.safe}><View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRatings(); }} tintColor={COLORS.primary} />}
      >
        <Text style={styles.overline}>ALL STUDENT FEEDBACK</Text>
        <Text style={styles.title}>Ratings & Reviews</Text>
        <Text style={styles.subtitle}>{ratings.length} total reviews collected</Text>

        {sortedDates.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubbles-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No feedback yet</Text>
          </View>
        ) : (
          sortedDates.map(date => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateLabel}>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
              {grouped[date].map(r => (
                <View key={r.id} style={styles.feedbackCard}>
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
                    <Text style={styles.fbServings}>{r.servings} serving{r.servings > 1 ? 's' : ''} · {r.calories * r.servings} kcal</Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: 100 },
  overline: { ...FONTS.overline, color: COLORS.primary },
  title: { ...FONTS.h2, color: COLORS.textPrimary },
  subtitle: { ...FONTS.bodySmall, color: COLORS.textMuted, marginBottom: SPACING.lg },
  dateGroup: { marginBottom: SPACING.lg },
  dateLabel: { ...FONTS.h4, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  feedbackCard: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  fbHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  fbAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  fbAvatarText: { ...FONTS.caption, color: COLORS.primary, fontSize: 12 },
  fbInfo: { flex: 1, marginLeft: SPACING.sm },
  fbEmail: { ...FONTS.bodySmall, color: COLORS.textPrimary, fontWeight: '600' },
  fbMeta: { ...FONTS.caption, color: COLORS.textMuted, fontSize: 10 },
  fbStars: { flexDirection: 'row' },
  fbBody: { marginLeft: 40 },
  fbItem: { ...FONTS.body, color: COLORS.textPrimary },
  fbServings: { ...FONTS.caption, color: COLORS.textMuted, fontSize: 10 },
  emptyBox: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { ...FONTS.body, color: COLORS.textMuted, marginTop: SPACING.sm },
});
