import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';
const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner'];
const DIET_TABS = ['vegetarian', 'non-veg', 'special'];

interface Meal {
  id: string; name: string; day: string; diet_type: string; meal: string;
  calories: number; protein_g: number; carbs_g: number; fat_g: number;
}

interface RatingState {
  [key: string]: { servings: number; rating: number };
}

export default function RatingScreen() {
  const { session, profile } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('breakfast');
  const [selectedDiet, setSelectedDiet] = useState('vegetarian');
  const [ratings, setRatings] = useState<RatingState>({});

  const today = DAYS[new Date().getDay()];
  const todayDate = new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    try {
      const [mealsRes, ratingsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/meals?day=${today}`),
        fetch(`${BACKEND_URL}/api/ratings?auth_user_id=${session?.user?.id}&log_date=${todayDate}`),
      ]);
      const mealsData = await mealsRes.json();
      const ratingsData = await ratingsRes.json();
      setMeals(mealsData);
      const rState: RatingState = {};
      for (const r of ratingsData) {
        const mealMatch = mealsData.find((m: Meal) => m.name === r.item_name && m.day === today && m.meal.toLowerCase() === r.slot.toLowerCase());
        if (mealMatch) {
          rState[mealMatch.id] = { servings: r.servings || 0, rating: r.rating || 0 };
        }
      }
      setRatings(rState);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [today, todayDate, session]);

  useEffect(() => {
    fetchData();
    if (profile?.diet_preference) {
      const dp = profile.diet_preference.toLowerCase();
      if (dp.includes('non')) setSelectedDiet('non-veg');
      else if (dp.includes('special')) setSelectedDiet('special');
    }
  }, [fetchData, profile]);

  const updateRating = (name: string, field: 'servings' | 'rating', value: number) => {
    setRatings(prev => ({
      ...prev,
      [name]: { ...prev[name] || { servings: 0, rating: 0 }, [field]: Math.max(0, value) },
    }));
  };

  const submitRatings = async () => {
    const toSubmit = Object.entries(ratings)
      .filter(([_, v]) => v.servings > 0 && v.rating > 0)
      .map(([id, v]) => {
        const meal = meals.find(m => m.id === id);
        return {
          auth_user_id: session?.user?.id || '',
          email: session?.user?.email || '',
          log_date: todayDate,
          diet_type: selectedDiet,
          slot: selectedSlot,
          item_name: meal?.name || id,
          servings: v.servings,
          rating: v.rating,
          calories: meal?.calories || 0,
          protein_g: meal?.protein_g || 0,
          carbs_g: meal?.carbs_g || 0,
          fat_g: meal?.fat_g || 0,
        };
      });
    if (toSubmit.length === 0) {
      Alert.alert('No Ratings', 'Set servings and rating for at least one item');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ratings/bulk`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toSubmit),
      });
      if (res.ok) Alert.alert('Success', 'Ratings submitted!');
      else throw new Error('Failed');
    } catch (err) { Alert.alert('Error', 'Failed to submit ratings'); }
    finally { setSaving(false); }
  };

  const slotMealMap: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
  const filteredMeals = meals.filter(m => m.diet_type === selectedDiet && m.meal === slotMealMap[selectedSlot]);

  if (loading) {
    return <SafeAreaView style={styles.safe}><View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primary} />}
      >
        <Text style={styles.title}>Daily Meal Ratings</Text>
        <Text style={styles.subtitle}>{today.charAt(0) + today.slice(1).toLowerCase()} menu reviews</Text>

        {/* Diet Tabs */}
        <View style={styles.dietTabRow}>
          {DIET_TABS.map(dt => (
            <TouchableOpacity key={dt} testID={`rating-diet-${dt}`} style={[styles.dietTab, selectedDiet === dt && styles.dietTabActive]} onPress={() => setSelectedDiet(dt)}>
              <Text style={[styles.dietTabText, selectedDiet === dt && styles.dietTabTextActive]}>
                {dt === 'vegetarian' ? 'Veg' : dt === 'non-veg' ? 'Non-Veg' : 'Special'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Slot Tabs */}
        <View style={styles.slotRow}>
          {MEAL_SLOTS.map(slot => (
            <TouchableOpacity key={slot} testID={`rating-slot-${slot}`} style={[styles.slotTab, selectedSlot === slot && styles.slotTabActive]} onPress={() => setSelectedSlot(slot)}>
              <Ionicons name={slot === 'breakfast' ? 'sunny-outline' : slot === 'lunch' ? 'restaurant-outline' : 'moon-outline'} size={16} color={selectedSlot === slot ? COLORS.primary : COLORS.textMuted} />
              <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>{slot.charAt(0).toUpperCase() + slot.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Meal Items */}
        {filteredMeals.length === 0 ? (
          <View style={styles.emptyBox}><Ionicons name="restaurant-outline" size={48} color={COLORS.border} /><Text style={styles.emptyText}>No meals for this selection</Text></View>
        ) : (
          filteredMeals.map(meal => {
            const r = ratings[meal.id] || { servings: 0, rating: 0 };
            return (
              <View key={meal.id} style={styles.ratingCard}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <View style={styles.nutriRow}>
                  <NutriPill icon="flame-outline" value={`${meal.calories} kcal`} color={COLORS.error} />
                  <NutriPill icon="barbell-outline" value={`${meal.protein_g}g P`} color={COLORS.info} />
                  <NutriPill icon="leaf-outline" value={`${meal.carbs_g}g C`} color={COLORS.warning} />
                  <NutriPill icon="water-outline" value={`${meal.fat_g}g F`} color={COLORS.primary} />
                </View>
                <View style={styles.controlsRow}>
                  <View style={styles.servingsBlock}>
                    <Text style={styles.controlLabel}>Servings</Text>
                    <View style={styles.servingsRow}>
                      <TouchableOpacity testID={`servings-minus-${meal.id}`} style={styles.servBtn} onPress={() => updateRating(meal.id, 'servings', r.servings - 1)}>
                        <Ionicons name="remove" size={18} color={COLORS.textPrimary} />
                      </TouchableOpacity>
                      <Text style={styles.servCount}>{r.servings}</Text>
                      <TouchableOpacity testID={`servings-plus-${meal.id}`} style={styles.servBtn} onPress={() => updateRating(meal.id, 'servings', r.servings + 1)}>
                        <Ionicons name="add" size={18} color={COLORS.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.starsBlock}>
                    <Text style={styles.controlLabel}>Rating</Text>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity key={star} testID={`star-${meal.id}-${star}`} onPress={() => updateRating(meal.id, 'rating', star)}>
                          <Ionicons name={star <= r.rating ? 'star' : 'star-outline'} size={24} color={star <= r.rating ? COLORS.star : COLORS.border} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewStatus}>
                  {r.servings > 0 && r.rating > 0 ? '✓ Review enabled' : 'Set servings to enable review'}
                </Text>
              </View>
            );
          })
        )}

        {filteredMeals.length > 0 && (
          <TouchableOpacity testID="submit-ratings-button" style={[styles.submitBtn, saving && { opacity: 0.7 }]} onPress={submitRatings} disabled={saving}>
            {saving ? <ActivityIndicator color={COLORS.textInverse} /> : <Text style={styles.submitBtnText}>Submit Ratings</Text>}
          </TouchableOpacity>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function NutriPill({ icon, value, color }: { icon: any; value: string; color: string }) {
  return (
    <View style={[pillStyles.pill, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={[pillStyles.text, { color }]}>{value}</Text>
    </View>
  );
}
const pillStyles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full, marginRight: 6 },
  text: { ...FONTS.caption, fontSize: 10, marginLeft: 3, fontWeight: '600' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: 100 },
  title: { ...FONTS.h2, color: COLORS.textPrimary },
  subtitle: { ...FONTS.bodySmall, color: COLORS.textMuted, marginBottom: SPACING.lg },
  dietTabRow: { flexDirection: 'row', backgroundColor: COLORS.backgroundSubtle, borderRadius: RADIUS.md, padding: 4, marginBottom: SPACING.md },
  dietTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.sm },
  dietTabActive: { backgroundColor: COLORS.background, ...SHADOWS.sm },
  dietTabText: { ...FONTS.bodySmall, color: COLORS.textMuted, fontWeight: '600' },
  dietTabTextActive: { color: COLORS.primary, fontWeight: '700' },
  slotRow: { flexDirection: 'row', marginBottom: SPACING.lg },
  slotTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, marginRight: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.backgroundSubtle, borderWidth: 1, borderColor: COLORS.border },
  slotTabActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  slotText: { ...FONTS.bodySmall, color: COLORS.textMuted, marginLeft: 6, fontWeight: '600' },
  slotTextActive: { color: COLORS.primary },
  ratingCard: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  mealName: { ...FONTS.h4, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  nutriRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  servingsBlock: { flex: 1 },
  starsBlock: { flex: 1, alignItems: 'flex-end' },
  controlLabel: { ...FONTS.caption, color: COLORS.textMuted, marginBottom: 6, fontSize: 10 },
  servingsRow: { flexDirection: 'row', alignItems: 'center' },
  servBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.backgroundSubtle, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  servCount: { ...FONTS.h3, color: COLORS.textPrimary, marginHorizontal: SPACING.md },
  starsRow: { flexDirection: 'row', gap: 4 },
  reviewStatus: { ...FONTS.caption, color: COLORS.success, fontSize: 11 },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center', marginTop: SPACING.md, ...SHADOWS.md },
  submitBtnText: { ...FONTS.h4, color: COLORS.textInverse },
  emptyBox: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { ...FONTS.body, color: COLORS.textMuted, marginTop: SPACING.sm },
});
