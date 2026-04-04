import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../src/constants/theme';
import MealCard from '../../src/components/MealCard';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';
const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Evening Snack', 'Dinner'];
const DIET_TABS = ['vegetarian', 'non-veg', 'special'];

interface Meal {
  id: string;
  name: string;
  day: string;
  diet_type: string;
  meal: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export default function DashboardScreen() {
  const { profile, session } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('Breakfast');
  const [selectedDiet, setSelectedDiet] = useState('vegetarian');
  const [error, setError] = useState('');

  const today = DAYS[new Date().getDay()];

  const fetchMeals = useCallback(async () => {
    try {
      setError('');
      const res = await fetch(`${BACKEND_URL}/api/meals?day=${today}`);
      if (!res.ok) throw new Error('Failed to fetch meals');
      const data = await res.json();
      setMeals(data);
    } catch (err: any) {
      console.warn("API failed, using mock data for UI testing");
      const mockMeals = [
        { id: '1', name: 'Oatmeal & Berries', day: today, diet_type: 'vegetarian', meal: 'Breakfast', calories: 300, protein_g: 10, carbs_g: 50, fat_g: 5, fiber_g: 8, image_url: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400' },
        { id: '2', name: 'Greek Yogurt Parfait', day: today, diet_type: 'vegetarian', meal: 'Breakfast', calories: 250, protein_g: 20, carbs_g: 30, fat_g: 5, fiber_g: 3, image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400' },
        { id: '3', name: 'Scrambled Eggs with Toast', day: today, diet_type: 'non-veg', meal: 'Breakfast', calories: 400, protein_g: 25, carbs_g: 30, fat_g: 20, fiber_g: 2, image_url: 'https://images.unsplash.com/photo-1525351484163-e14500b8c1ef?w=400' },
        { id: '4', name: 'Grilled Chicken Salad', day: today, diet_type: 'non-veg', meal: 'Lunch', calories: 450, protein_g: 40, carbs_g: 15, fat_g: 25, fiber_g: 5, image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
        { id: '5', name: 'Paneer Tikka Wrap', day: today, diet_type: 'vegetarian', meal: 'Lunch', calories: 500, protein_g: 20, carbs_g: 60, fat_g: 15, fiber_g: 6, image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
        { id: '6', name: 'Apple & Peanut Butter', day: today, diet_type: 'vegetarian', meal: 'Evening Snack', calories: 200, protein_g: 5, carbs_g: 25, fat_g: 10, fiber_g: 4 },
        { id: '7', name: 'Protein Shake', day: today, diet_type: 'non-veg', meal: 'Evening Snack', calories: 150, protein_g: 25, carbs_g: 5, fat_g: 2, fiber_g: 1, image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400' },
        { id: '8', name: 'Quinoa & Veggie Bowl', day: today, diet_type: 'vegetarian', meal: 'Dinner', calories: 400, protein_g: 15, carbs_g: 60, fat_g: 10, fiber_g: 10, image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' },
        { id: '9', name: 'Baked Salmon & Asparagus', day: today, diet_type: 'non-veg', meal: 'Dinner', calories: 500, protein_g: 35, carbs_g: 10, fat_g: 25, fiber_g: 4, image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400' },
        { id: '10', name: 'Gluten-Free Pancakes', day: today, diet_type: 'special', meal: 'Breakfast', calories: 350, protein_g: 10, carbs_g: 60, fat_g: 5, fiber_g: 5, image_url: 'https://images.unsplash.com/photo-1528207776546-384cb1119b27?w=400' },
        { id: '11', name: 'Vegan Tofu Stir-fry', day: today, diet_type: 'special', meal: 'Dinner', calories: 300, protein_g: 20, carbs_g: 20, fat_g: 15, fiber_g: 6, image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400' }
      ];
      setMeals(mockMeals);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [today]);

  useEffect(() => {
    fetchMeals();
    if (profile?.diet_preference) {
      const dp = profile.diet_preference.toLowerCase();
      if (dp.includes('non')) setSelectedDiet('non-veg');
      else if (dp.includes('special')) setSelectedDiet('special');
      else setSelectedDiet('vegetarian');
    }
  }, [fetchMeals, profile]);

  const filteredMeals = meals.filter(m => m.diet_type === selectedDiet && m.meal === selectedSlot);
  const allDietMeals = meals.filter(m => m.diet_type === selectedDiet);
  const totalCalories = allDietMeals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = allDietMeals.reduce((s, m) => s + m.protein_g, 0);
  const totalCarbs = allDietMeals.reduce((s, m) => s + m.carbs_g, 0);
  const totalFat = allDietMeals.reduce((s, m) => s + m.fat_g, 0);

  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your menu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMeals(); }} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{profile?.full_name || 'Student'}</Text>
          </View>
          <View style={styles.logoBadge}>
            <Ionicons name="leaf" size={14} color={COLORS.textInverse} />
            <Text style={styles.logoText}>FitVit</Text>
          </View>
        </View>

        {/* Daily Energy Card */}
        <View style={styles.energyCard}>
          <Text style={styles.energyOverline}>DAILY ENERGY</Text>
          <View style={styles.energyRow}>
            <View style={styles.kcalBlock}>
              <Text style={styles.kcalValue}>{totalCalories}</Text>
              <Text style={styles.kcalLabel}>kcal</Text>
            </View>
            <View style={styles.macroGrid}>
              <MacroItem label="Protein" value={`${totalProtein}g`} color={COLORS.info} icon="barbell-outline" />
              <MacroItem label="Carbs" value={`${totalCarbs}g`} color={COLORS.warning} icon="leaf-outline" />
              <MacroItem label="Fats" value={`${totalFat}g`} color={COLORS.error} icon="water-outline" />
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min((totalCalories / 2200) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.max(2200 - totalCalories, 0)} kcal remaining of 2200 target</Text>
        </View>

        {/* Diet Type Tabs */}
        <View style={styles.dietTabRow}>
          {DIET_TABS.map(dt => (
            <TouchableOpacity
              key={dt}
              testID={`diet-tab-${dt}`}
              style={[styles.dietTab, selectedDiet === dt && styles.dietTabActive]}
              onPress={() => setSelectedDiet(dt)}
            >
              <Text style={[styles.dietTabText, selectedDiet === dt && styles.dietTabTextActive]}>
                {dt === 'vegetarian' ? 'Veg' : dt === 'non-veg' ? 'Non-Veg' : 'Special'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Menu */}
        <Text style={styles.sectionTitle}>Today's Menu — {today.charAt(0) + today.slice(1).toLowerCase()}</Text>

        {/* Meal Slot Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotTabScroll}>
          {MEAL_SLOTS.map(slot => (
            <TouchableOpacity
              key={slot}
              testID={`slot-tab-${slot.toLowerCase().replace(' ', '-')}`}
              style={[styles.slotTab, selectedSlot === slot && styles.slotTabActive]}
              onPress={() => setSelectedSlot(slot)}
            >
              <Ionicons
                name={slot === 'Breakfast' ? 'sunny-outline' : slot === 'Lunch' ? 'restaurant-outline' : slot === 'Dinner' ? 'moon-outline' : 'cafe-outline'}
                size={16}
                color={selectedSlot === slot ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={[styles.slotTabText, selectedSlot === slot && styles.slotTabTextActive]}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Meal Cards */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filteredMeals.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="restaurant-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No meals found for this selection</Text>
          </View>
        ) : (
          filteredMeals.map(meal => (
            <MealCard key={meal.id} {...meal} />
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MacroItem({ label, value, color, icon }: { label: string; value: string; color: string; icon: any }) {
  return (
    <View style={macroStyles.item}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[macroStyles.value, { color }]}>{value}</Text>
      <Text style={macroStyles.label}>{label}</Text>
    </View>
  );
}

const macroStyles = StyleSheet.create({
  item: { alignItems: 'center', flex: 1 },
  value: { ...FONTS.h4, marginTop: 2 },
  label: { ...FONTS.caption, color: 'rgba(255,255,255,0.6)', fontSize: 9 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...FONTS.body, color: COLORS.textMuted, marginTop: SPACING.sm },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  greeting: { ...FONTS.bodySmall, color: COLORS.textMuted },
  userName: { ...FONTS.h2, color: COLORS.textPrimary },
  logoBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full },
  logoText: { ...FONTS.bodySmall, color: COLORS.textInverse, fontWeight: '700', marginLeft: 4 },
  energyCard: {
    backgroundColor: COLORS.darkCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  energyOverline: { ...FONTS.overline, color: COLORS.primary, marginBottom: SPACING.sm },
  energyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  kcalBlock: { marginRight: SPACING.lg },
  kcalValue: { fontSize: 48, fontWeight: '800', color: COLORS.textInverse, lineHeight: 52 },
  kcalLabel: { ...FONTS.body, color: 'rgba(255,255,255,0.6)' },
  macroGrid: { flexDirection: 'row', flex: 1 },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  progressText: { ...FONTS.caption, color: 'rgba(255,255,255,0.5)', marginTop: 6, fontSize: 10 },
  dietTabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSubtle,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  dietTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.sm },
  dietTabActive: { backgroundColor: COLORS.background, ...SHADOWS.sm },
  dietTabText: { ...FONTS.bodySmall, color: COLORS.textMuted, fontWeight: '600' },
  dietTabTextActive: { color: COLORS.primary, fontWeight: '700' },
  sectionTitle: { ...FONTS.h3, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  slotTabScroll: { marginBottom: SPACING.md },
  slotTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slotTabActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  slotTabText: { ...FONTS.bodySmall, color: COLORS.textMuted, marginLeft: 6, fontWeight: '600' },
  slotTabTextActive: { color: COLORS.primary },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: SPACING.md, borderRadius: RADIUS.md, marginTop: SPACING.md },
  errorText: { ...FONTS.body, color: COLORS.error, marginLeft: SPACING.sm },
  emptyBox: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { ...FONTS.body, color: COLORS.textMuted, marginTop: SPACING.sm },
});
