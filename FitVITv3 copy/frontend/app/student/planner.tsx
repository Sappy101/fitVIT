import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/constants/theme';
import MealCard from '../../src/components/MealCard';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';
const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Evening Snack', 'Dinner'];
const DIET_TABS = ['vegetarian', 'non-veg', 'special'];

interface Meal {
  id: string; name: string; day: string; diet_type: string; meal: string;
  calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number;
}

export default function PlannerScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(getTodayIndex());
  const [selectedDiet, setSelectedDiet] = useState('vegetarian');

  function getTodayIndex() {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  }

  const fetchMeals = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/meals`);
      const data = await res.json();
      setMeals(data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchMeals(); }, [fetchMeals]);

  const dayMeals = meals.filter(m => m.day === DAYS_ORDER[selectedDay] && m.diet_type === selectedDiet);
  const totalCal = dayMeals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = dayMeals.reduce((s, m) => s + m.protein_g, 0);
  const totalFat = dayMeals.reduce((s, m) => s + m.fat_g, 0);

  // Compute dates for this week
  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return DAYS_ORDER.map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.getDate();
    });
  };
  const weekDates = getWeekDates();

  if (loading) {
    return <SafeAreaView style={styles.safe}><View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMeals(); }} tintColor={COLORS.primary} />}
      >
        <Text style={styles.title}>Weekly Performance Menu</Text>
        <Text style={styles.subtitle}>Fuel your academic excellence</Text>

        {/* Week Calendar */}
        <View style={styles.weekRow}>
          {DAYS_ORDER.map((day, i) => (
            <TouchableOpacity
              key={day}
              testID={`planner-day-${day.toLowerCase()}`}
              style={[styles.dayBtn, selectedDay === i && styles.dayBtnActive]}
              onPress={() => setSelectedDay(i)}
            >
              <Text style={[styles.dayLabel, selectedDay === i && styles.dayLabelActive]}>{DAY_SHORT[i]}</Text>
              <View style={[styles.dayCircle, selectedDay === i && styles.dayCircleActive]}>
                <Text style={[styles.dayDate, selectedDay === i && styles.dayDateActive]}>{weekDates[i]}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Diet Tabs */}
        <View style={styles.dietTabRow}>
          {DIET_TABS.map(dt => (
            <TouchableOpacity key={dt} testID={`planner-diet-${dt}`} style={[styles.dietTab, selectedDiet === dt && styles.dietTabActive]} onPress={() => setSelectedDiet(dt)}>
              <Text style={[styles.dietTabText, selectedDiet === dt && styles.dietTabTextActive]}>
                {dt === 'vegetarian' ? 'Veg' : dt === 'non-veg' ? 'Non-Veg' : 'Special'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Meal Sections */}
        {MEAL_SLOTS.map(slot => {
          const slotMeals = dayMeals.filter(m => m.meal === slot);
          if (slotMeals.length === 0) return null;
          return (
            <View key={slot} style={styles.mealSection}>
              <View style={styles.slotHeader}>
                <Ionicons
                  name={slot === 'Breakfast' ? 'sunny' : slot === 'Lunch' ? 'restaurant' : slot === 'Dinner' ? 'moon' : 'cafe'}
                  size={18} color={COLORS.primary}
                />
                <Text style={styles.slotTitle}>{slot}</Text>
                <Text style={styles.slotDesc}>
                  {slot === 'Breakfast' ? 'Morning fuel for focused classes' : slot === 'Lunch' ? 'Balanced mid-day performance plate' : slot === 'Dinner' ? 'Recovery and restoration meal' : 'Energy boost'}
                </Text>
              </View>
              {slotMeals.map(meal => <MealCard key={meal.id} {...meal} />)}
            </View>
          );
        })}

        {dayMeals.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="restaurant-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No meals scheduled for this day</Text>
          </View>
        )}

        {/* Day Totals */}
        {dayMeals.length > 0 && (
          <View style={styles.totalsCard}>
            <Text style={styles.totalsTitle}>Day Total</Text>
            <View style={styles.totalsRow}>
              <View style={styles.totalItem}>
                <Ionicons name="flame" size={20} color={COLORS.error} />
                <Text style={styles.totalValue}>{totalCal}</Text>
                <Text style={styles.totalLabel}>Kcal</Text>
              </View>
              <View style={styles.totalItem}>
                <Ionicons name="barbell" size={20} color={COLORS.info} />
                <Text style={styles.totalValue}>{totalProtein}g</Text>
                <Text style={styles.totalLabel}>Protein</Text>
              </View>
              <View style={styles.totalItem}>
                <Ionicons name="water" size={20} color={COLORS.primary} />
                <Text style={styles.totalValue}>{totalFat}g</Text>
                <Text style={styles.totalLabel}>Fats</Text>
              </View>
            </View>
          </View>
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
  title: { ...FONTS.h2, color: COLORS.textPrimary },
  subtitle: { ...FONTS.bodySmall, color: COLORS.textMuted, marginBottom: SPACING.lg },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg },
  dayBtn: { alignItems: 'center', flex: 1 },
  dayBtnActive: {},
  dayLabel: { ...FONTS.caption, color: COLORS.textMuted, marginBottom: 6, fontSize: 10 },
  dayLabelActive: { color: COLORS.primary },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.backgroundSubtle },
  dayCircleActive: { backgroundColor: COLORS.primary },
  dayDate: { ...FONTS.body, color: COLORS.textPrimary, fontWeight: '700' },
  dayDateActive: { color: COLORS.textInverse },
  dietTabRow: { flexDirection: 'row', backgroundColor: COLORS.backgroundSubtle, borderRadius: RADIUS.md, padding: 4, marginBottom: SPACING.lg },
  dietTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.sm },
  dietTabActive: { backgroundColor: COLORS.background, ...SHADOWS.sm },
  dietTabText: { ...FONTS.bodySmall, color: COLORS.textMuted, fontWeight: '600' },
  dietTabTextActive: { color: COLORS.primary, fontWeight: '700' },
  mealSection: { marginBottom: SPACING.lg },
  slotHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, flexWrap: 'wrap' },
  slotTitle: { ...FONTS.h4, color: COLORS.textPrimary, marginLeft: SPACING.sm },
  slotDesc: { ...FONTS.caption, color: COLORS.textMuted, width: '100%', marginLeft: 34, marginTop: 2, fontSize: 10, fontWeight: '400' },
  emptyBox: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { ...FONTS.body, color: COLORS.textMuted, marginTop: SPACING.sm },
  totalsCard: { backgroundColor: COLORS.darkCard, borderRadius: RADIUS.xl, padding: SPACING.lg, ...SHADOWS.lg },
  totalsTitle: { ...FONTS.overline, color: COLORS.primary, marginBottom: SPACING.md },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  totalItem: { alignItems: 'center' },
  totalValue: { ...FONTS.h2, color: COLORS.textInverse, marginTop: 4 },
  totalLabel: { ...FONTS.caption, color: 'rgba(255,255,255,0.5)', fontSize: 10 },
});
