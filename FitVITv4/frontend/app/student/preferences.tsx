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

interface Meal { id: string; name: string; day: string; diet_type: string; meal: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; }

export default function PreferencesScreen() {
  const { session } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('breakfast');
  const [selectedDiet, setSelectedDiet] = useState('vegetarian');
  const [prefs, setPrefs] = useState<Record<string, number>>({});

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = DAYS[tomorrow.getDay()];
  const tomorrowDate = tomorrow.toISOString().split('T')[0];
  const tomorrowLabel = tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const fetchData = useCallback(async () => {
    try {
      const [mealsRes, prefsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/meals?day=${tomorrowDay}`),
        fetch(`${BACKEND_URL}/api/preferences?auth_user_id=${session?.user?.id}&log_date=${tomorrowDate}`),
      ]);
      const mealsData = await mealsRes.json();
      setMeals(mealsData);
      const prefsData = await prefsRes.json();
      const pState: Record<string, number> = {};
      for (const p of prefsData) {
        const mealMatch = mealsData.find((m: Meal) => m.name === p.item_name && m.day === tomorrowDay && m.meal.toLowerCase() === p.slot.toLowerCase());
        if (mealMatch) {
          pState[mealMatch.id] = p.preference_value;
        }
      }
      setPrefs(pState);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [tomorrowDay, tomorrowDate, session]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const togglePref = (name: string) => {
    setPrefs(prev => {
      const cur = prev[name] || 0;
      if (cur === 1) return { ...prev, [name]: -1 };
      if (cur === -1) return { ...prev, [name]: 0 };
      return { ...prev, [name]: 1 };
    });
  };

  const submitPrefs = async () => {
    const toSubmit = Object.entries(prefs)
      .filter(([_, v]) => v !== 0)
      .map(([id, value]) => {
        const meal = meals.find(m => m.id === id);
        return {
          auth_user_id: session?.user?.id || '',
          email: session?.user?.email || '',
          log_date: tomorrowDate,
          diet_type: selectedDiet,
          slot: selectedSlot,
          item_name: meal?.name || id,
          preference_value: value,
        };
      });
    if (toSubmit.length === 0) { Alert.alert('No Preferences', 'Select at least one item'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/preferences/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toSubmit) });
      if (res.ok) Alert.alert('Success', 'Preferences saved!');
      else throw new Error('Failed');
    } catch (err) { Alert.alert('Error', 'Failed to save preferences'); }
    finally { setSaving(false); }
  };

  const slotMap: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
  const filteredMeals = meals.filter(m => m.diet_type === selectedDiet && m.meal === slotMap[selectedSlot]);

  if (loading) {
    return <SafeAreaView style={styles.safe}><View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primary} />}
      >
        <Text style={styles.title}>Food Preferences</Text>
        <Text style={styles.subtitle}>Set your menu choices for {tomorrowLabel}</Text>

        {/* Diet Tabs */}
        <View style={styles.dietTabRow}>
          {DIET_TABS.map(dt => (
            <TouchableOpacity key={dt} testID={`pref-diet-${dt}`} style={[styles.dietTab, selectedDiet === dt && styles.dietTabActive]} onPress={() => setSelectedDiet(dt)}>
              <Text style={[styles.dietTabText, selectedDiet === dt && styles.dietTabTextActive]}>
                {dt === 'vegetarian' ? 'Veg' : dt === 'non-veg' ? 'Non-Veg' : 'Special'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Slot Tabs */}
        <View style={styles.slotRow}>
          {MEAL_SLOTS.map(slot => (
            <TouchableOpacity key={slot} testID={`pref-slot-${slot}`} style={[styles.slotTab, selectedSlot === slot && styles.slotTabActive]} onPress={() => setSelectedSlot(slot)}>
              <Ionicons name={slot === 'breakfast' ? 'sunny-outline' : slot === 'lunch' ? 'restaurant-outline' : 'moon-outline'} size={16} color={selectedSlot === slot ? COLORS.primary : COLORS.textMuted} />
              <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>{slot.charAt(0).toUpperCase() + slot.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredMeals.length === 0 ? (
          <View style={styles.emptyBox}><Ionicons name="restaurant-outline" size={48} color={COLORS.border} /><Text style={styles.emptyText}>No meals for this selection</Text></View>
        ) : (
          filteredMeals.map(meal => {
            const pref = prefs[meal.id] || 0;
            return (
              <TouchableOpacity key={meal.id} testID={`pref-item-${meal.id}`} style={[styles.prefCard, pref === 1 && styles.prefCardLiked, pref === -1 && styles.prefCardDisliked]} onPress={() => togglePref(meal.id)} activeOpacity={0.7}>
                <View style={styles.prefHeader}>
                  <Text style={styles.prefName}>{meal.name}</Text>
                  <View style={[styles.prefBadge, pref === 1 && styles.prefBadgeLiked, pref === -1 && styles.prefBadgeDisliked]}>
                    <Ionicons name={pref === 1 ? 'checkmark' : pref === -1 ? 'close' : 'remove'} size={16} color={pref === 1 ? COLORS.success : pref === -1 ? COLORS.error : COLORS.textMuted} />
                  </View>
                </View>
                <View style={styles.prefNutri}>
                  <Text style={styles.nutriText}>{meal.calories} kcal</Text>
                  <Text style={styles.nutriDot}>·</Text>
                  <Text style={styles.nutriText}>{meal.protein_g}g protein</Text>
                  <Text style={styles.nutriDot}>·</Text>
                  <Text style={styles.nutriText}>{meal.carbs_g}g carbs</Text>
                  <Text style={styles.nutriDot}>·</Text>
                  <Text style={styles.nutriText}>{meal.fat_g}g fat</Text>
                </View>
                <Text style={styles.prefHint}>Tap to cycle: Preferred → Disliked → Neutral</Text>
              </TouchableOpacity>
            );
          })
        )}

        <Text style={styles.noteText}>You can update your choices until 10:00 PM tonight</Text>

        {filteredMeals.length > 0 && (
          <TouchableOpacity testID="submit-preferences-button" style={[styles.submitBtn, saving && { opacity: 0.7 }]} onPress={submitPrefs} disabled={saving}>
            {saving ? <ActivityIndicator color={COLORS.textInverse} /> : <Text style={styles.submitBtnText}>Save Preferences</Text>}
          </TouchableOpacity>
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
  prefCard: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.border },
  prefCardLiked: { borderColor: COLORS.success, backgroundColor: '#F0FDF4' },
  prefCardDisliked: { borderColor: COLORS.error, backgroundColor: '#FEF2F2' },
  prefHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  prefName: { ...FONTS.h4, color: COLORS.textPrimary, flex: 1, marginRight: SPACING.sm },
  prefBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.backgroundSubtle, alignItems: 'center', justifyContent: 'center' },
  prefBadgeLiked: { backgroundColor: COLORS.primaryLight },
  prefBadgeDisliked: { backgroundColor: '#FEE2E2' },
  prefNutri: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  nutriText: { ...FONTS.caption, color: COLORS.textMuted, fontSize: 11 },
  nutriDot: { ...FONTS.caption, color: COLORS.border, marginHorizontal: 4 },
  prefHint: { ...FONTS.caption, color: COLORS.textMuted, fontSize: 9, marginTop: 4 },
  noteText: { ...FONTS.bodySmall, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.md, fontStyle: 'italic' },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center', marginTop: SPACING.md, ...SHADOWS.md },
  submitBtnText: { ...FONTS.h4, color: COLORS.textInverse },
  emptyBox: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { ...FONTS.body, color: COLORS.textMuted, marginTop: SPACING.sm },
});
