/**
 * wasteEngine.ts — Synchronous Waste Management Analytics Engine
 * Generates deterministic sample data for 7 days of campus mess waste
 * across 3 categories: Bones, Dry Waste, Wet Waste.
 *
 * Zero async. Zero fetch. Zero database. Pure math on the edge.
 */

export interface DailyWaste {
  day: string;        // e.g. "Mon", "Tue"
  fullDay: string;    // e.g. "Monday"
  date: string;       // e.g. "2026-03-29"
  bones_kg: number;
  dry_kg: number;
  wet_kg: number;
  total_kg: number;
}

export interface WasteAnalytics {
  dailyData: DailyWaste[];
  totals: { bones: number; dry: number; wet: number; total: number };
  averages: { bones: string; dry: string; wet: string; total: string };
  peakDay: { day: string; total: number };
  lowestDay: { day: string; total: number };
  recycling: {
    manure_potential_kg: string;
    pet_shelter_kg: string;
    compost_kg: string;
    total_recyclable_pct: string;
  };
  insights: string[];
  categoryBreakdown: Array<{
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }>;
}

// Deterministic seeded random generator (Mulberry32)
function seededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getWasteAnalytics(): WasteAnalytics {
  const rand = seededRandom(2026);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Generate a realistic 7-day dataset
  // Bones: 2-8 kg/day (lower volume, dense material)
  // Dry waste: 8-25 kg/day (peels, shells — moderate volume)
  // Wet waste: 15-45 kg/day (student leftovers — highest volume)
  const today = new Date();
  const dailyData: DailyWaste[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayIndex = (d.getDay() + 6) % 7; // Mon=0 … Sun=6

    // Weekend tends to have less waste (fewer students on campus)
    const weekendFactor = dayIndex >= 5 ? 0.65 : 1.0;
    // Mid-week peak factor (Wednesday/Thursday tend to be busiest)
    const midWeekBoost = dayIndex === 2 || dayIndex === 3 ? 1.2 : 1.0;

    const bones = Math.round((2 + rand() * 6) * weekendFactor * midWeekBoost * 10) / 10;
    const dry = Math.round((8 + rand() * 17) * weekendFactor * midWeekBoost * 10) / 10;
    const wet = Math.round((15 + rand() * 30) * weekendFactor * midWeekBoost * 10) / 10;

    dailyData.push({
      day: dayShort[dayIndex],
      fullDay: dayNames[dayIndex],
      date: d.toISOString().slice(0, 10),
      bones_kg: bones,
      dry_kg: dry,
      wet_kg: wet,
      total_kg: Math.round((bones + dry + wet) * 10) / 10,
    });
  }

  // Totals
  const totals = {
    bones: Math.round(dailyData.reduce((s, d) => s + d.bones_kg, 0) * 10) / 10,
    dry: Math.round(dailyData.reduce((s, d) => s + d.dry_kg, 0) * 10) / 10,
    wet: Math.round(dailyData.reduce((s, d) => s + d.wet_kg, 0) * 10) / 10,
    total: 0,
  };
  totals.total = Math.round((totals.bones + totals.dry + totals.wet) * 10) / 10;

  // Rolling averages
  const n = dailyData.length;
  const averages = {
    bones: (totals.bones / n).toFixed(1),
    dry: (totals.dry / n).toFixed(1),
    wet: (totals.wet / n).toFixed(1),
    total: (totals.total / n).toFixed(1),
  };

  // Peak and lowest days
  let peakDay = dailyData[0];
  let lowestDay = dailyData[0];
  for (const d of dailyData) {
    if (d.total_kg > peakDay.total_kg) peakDay = d;
    if (d.total_kg < lowestDay.total_kg) lowestDay = d;
  }

  // Recycling potential
  // Dry waste: ~85% can become manure after drying
  // Bones: ~90% can be supplied to pet shelters
  // Wet waste: ~70% can be composted
  const manure = totals.dry * 0.85;
  const petShelter = totals.bones * 0.9;
  const compost = totals.wet * 0.7;
  const totalRecyclable = manure + petShelter + compost;
  const recyclablePct = totals.total > 0 ? (totalRecyclable / totals.total) * 100 : 0;

  const recycling = {
    manure_potential_kg: manure.toFixed(1),
    pet_shelter_kg: petShelter.toFixed(1),
    compost_kg: compost.toFixed(1),
    total_recyclable_pct: recyclablePct.toFixed(0),
  };

  // Smart insights
  const insights: string[] = [];
  insights.push(`🏆 ${peakDay.fullDay} generates the most waste at ${peakDay.total_kg} kg — consider reducing portion sizes on this day.`);
  insights.push(`✅ ${lowestDay.fullDay} is the cleanest day with only ${lowestDay.total_kg} kg — study what makes this day efficient.`);
  if (totals.wet > totals.dry + totals.bones) {
    insights.push(`⚠️ Wet waste (leftovers) accounts for ${Math.round((totals.wet / totals.total) * 100)}% of all waste — plate-size awareness campaigns could reduce this significantly.`);
  }
  insights.push(`♻️ ${recycling.total_recyclable_pct}% of total waste is recyclable — ${recycling.manure_potential_kg} kg as manure, ${recycling.pet_shelter_kg} kg to pet shelters, ${recycling.compost_kg} kg compostable.`);

  // Pie chart data
  const categoryBreakdown = [
    { name: 'Wet Waste', population: Math.round(totals.wet), color: '#2196F3', legendFontColor: '#6B7280', legendFontSize: 12 },
    { name: 'Dry Waste', population: Math.round(totals.dry), color: '#FF9800', legendFontColor: '#6B7280', legendFontSize: 12 },
    { name: 'Bones', population: Math.round(totals.bones), color: '#F44336', legendFontColor: '#6B7280', legendFontSize: 12 },
  ];

  return {
    dailyData,
    totals,
    averages,
    peakDay: { day: peakDay.fullDay, total: peakDay.total_kg },
    lowestDay: { day: lowestDay.fullDay, total: lowestDay.total_kg },
    recycling,
    insights,
    categoryBreakdown,
  };
}
