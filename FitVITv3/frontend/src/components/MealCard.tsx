import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../constants/theme';

interface MealCardProps {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  diet_type: string;
  onPress?: () => void;
}

export default function MealCard({ name, calories, protein_g, carbs_g, fat_g, diet_type, onPress }: MealCardProps) {
  const dietColor = diet_type === 'vegetarian' ? COLORS.success : diet_type === 'non-veg' ? COLORS.error : COLORS.warning;
  const dietLabel = diet_type === 'vegetarian' ? 'VEG' : diet_type === 'non-veg' ? 'NON-VEG' : 'SPECIAL';

  return (
    <TouchableOpacity
      testID={`meal-card-${name.replace(/\s+/g, '-').toLowerCase()}`}
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={2}>{name}</Text>
          <View style={[styles.dietBadge, { backgroundColor: dietColor + '20' }]}>
            <View style={[styles.dietDot, { backgroundColor: dietColor }]} />
            <Text style={[styles.dietText, { color: dietColor }]}>{dietLabel}</Text>
          </View>
        </View>
      </View>
      <View style={styles.nutritionRow}>
        <NutriBadge icon="flame-outline" value={`${calories}`} unit="kcal" color={COLORS.error} />
        <NutriBadge icon="barbell-outline" value={`${protein_g}g`} unit="protein" color={COLORS.info} />
        <NutriBadge icon="leaf-outline" value={`${carbs_g}g`} unit="carbs" color={COLORS.warning} />
        <NutriBadge icon="water-outline" value={`${fat_g}g`} unit="fat" color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
}

function NutriBadge({ icon, value, unit, color }: { icon: any; value: string; unit: string; color: string }) {
  return (
    <View style={styles.nutriBadge}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.nutriValue, { color }]}>{value}</Text>
      <Text style={styles.nutriUnit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  header: {
    marginBottom: SPACING.sm,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    ...FONTS.h4,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  dietBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  dietDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  dietText: {
    ...FONTS.caption,
    fontSize: 9,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutriBadge: {
    alignItems: 'center',
    flex: 1,
  },
  nutriValue: {
    ...FONTS.bodySmall,
    fontWeight: '700',
    marginTop: 2,
  },
  nutriUnit: {
    ...FONTS.caption,
    color: COLORS.textMuted,
    fontSize: 9,
  },
});
