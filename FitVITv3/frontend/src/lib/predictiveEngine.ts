import mockMealsData from '../data/meals_vault_rows.json';
import mockRatingsData from '../data/meal_ratings_daily_rows.json';
import mockPrefsData from '../data/meal_preferences_daily_rows.json';
import { COLORS } from '../constants/theme';

export interface AnalyticsModel {
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
    avg_rating: string;
    total_ratings: number;
    pref_likes: number;
    pref_dislikes: number;
    demand_score: number;
    waste_risk: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  dietDistribution: Array<{
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }>;
  recommendations: string[];
}

export function generateAdminAnalytics(): AnalyticsModel {
  const itemStats: Record<string, any> = {};

  // Initialize from vault
  mockMealsData.forEach((m: any) => {
    itemStats[m.name] = {
      item_name: m.name,
      diet_type: m.diet_type,
      total_ratings: 0,
      sum_ratings: 0,
      pref_likes: 0,
      pref_dislikes: 0,
      demand_score: 50, // default neutral
    };
  });

  // Apply Ratings
  let globalSum = 0;
  let globalCount = 0;
  mockRatingsData.forEach((r: any) => {
    const val = parseInt(r.rating) || 0;
    if (val > 0) {
      if (!itemStats[r.item_name]) itemStats[r.item_name] = { item_name: r.item_name, diet_type: r.diet_type, total_ratings: 0, sum_ratings: 0, pref_likes: 0, pref_dislikes: 0 };
      itemStats[r.item_name].total_ratings += 1;
      itemStats[r.item_name].sum_ratings += val;
      globalSum += val;
      globalCount += 1;
    }
  });

  // Apply Preferences
  mockPrefsData.forEach((p: any) => {
    const val = parseInt(p.preference_value) || 0;
    if (!itemStats[p.item_name]) itemStats[p.item_name] = { item_name: p.item_name, diet_type: p.diet_type, total_ratings: 0, sum_ratings: 0, pref_likes: 0, pref_dislikes: 0 };
    if (val === 1) itemStats[p.item_name].pref_likes += 1;
    if (val === -1) itemStats[p.item_name].pref_dislikes += 1;
  });

  const demandItems = Object.values(itemStats).map(stat => {
    const avgRating = stat.total_ratings > 0 ? stat.sum_ratings / stat.total_ratings : 0;
    const totalPrefs = stat.pref_likes + stat.pref_dislikes;
    
    // Linear Predictor Logic!
    // Weighted combination of Rating (60%) and Explicit Preference (40%) mapping to 0-100% Demand Score.
    let ratingScore = avgRating > 0 ? ((avgRating - 1) / 4) * 60 : 30; // default to 50% impact if no rating
    let prefScore = totalPrefs > 0 ? (stat.pref_likes / totalPrefs) * 40 : 20; 
    
    let demand = ratingScore + prefScore;

    let waste_risk: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (demand < 35) waste_risk = 'HIGH';
    else if (demand < 60) waste_risk = 'MEDIUM';

    return {
      item_name: stat.item_name,
      avg_rating: avgRating.toFixed(1),
      total_ratings: stat.total_ratings,
      pref_likes: stat.pref_likes,
      pref_dislikes: stat.pref_dislikes,
      demand_score: Math.round(demand),
      waste_risk,
      diet_type: stat.diet_type
    };
  }).filter(i => i.total_ratings > 0 || (i.pref_likes + i.pref_dislikes) > 0);

  demandItems.sort((a, b) => b.demand_score - a.demand_score);

  // Diet Distribution Pie Data
  let vegCount = 0;
  let nonCount = 0;
  let spCount = 0;
  mockMealsData.forEach((m: any) => {
    const dt = (m.diet_type || '').toLowerCase();
    if (dt === 'vegetarian' || dt === 'veg') vegCount++;
    else if (dt === 'non-veg' || dt === 'non_veg') nonCount++;
    else spCount++;
  });

  const dietDistribution = [
    { name: 'Vegetarian', population: vegCount, color: '#4CAF50', legendFontColor: COLORS.textSecondary, legendFontSize: 12 },
    { name: 'Non-Veg', population: nonCount, color: '#F44336', legendFontColor: COLORS.textSecondary, legendFontSize: 12 },
    { name: 'Special', population: spCount, color: '#2196F3', legendFontColor: COLORS.textSecondary, legendFontSize: 12 },
  ];

  const highWasteCount = demandItems.filter(d => d.waste_risk === 'HIGH').length;
  
  const recommendations = [];
  if (highWasteCount > 0) recommendations.push(`Warning: ${highWasteCount} items show HIGH waste risk. Consider dropping lowest items.`);
  if (demandItems.length > 0) recommendations.push(`Keep ${demandItems[0].item_name} active. Demand is soaring!`);
  if (globalCount > 0) recommendations.push(`Students gave an average rating of ${(globalSum/globalCount).toFixed(1)}/5.`);

  return {
    summary: {
      total_menu_items: mockMealsData.length,
      rated_items: demandItems.length,
      total_ratings: globalCount,
      avg_overall_rating: globalCount > 0 ? parseFloat((globalSum/globalCount).toFixed(1)) : 0,
      high_waste_risk: highWasteCount,
      medium_waste_risk: demandItems.filter(d => d.waste_risk === 'MEDIUM').length,
    },
    demand_items: demandItems,
    dietDistribution,
    recommendations
  };
}
