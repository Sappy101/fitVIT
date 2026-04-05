import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';

import mockMealsData from '../src/data/meals_vault_rows.json';
import mockRatingsData from '../src/data/meal_ratings_daily_rows.json';
import mockPrefsData from '../src/data/meal_preferences_daily_rows.json';
import mockProfilesData from '../src/data/profiles_rows.json';

LogBox.ignoreLogs([
  '"shadow*" style props are deprecated',
  'props.pointerEvents is deprecated',
]);

// --- Global UI Testing Bypass ---
const originalFetch = global.fetch;
global.fetch = async (...args) => {
  try {
    const url = typeof args[0] === 'string' ? args[0] : ((args[0] as unknown) as Request)?.url || '';
    
    // Intercept dummy supabase calls to prevent "Network request failed" in GoTrueClient
    if (url && url.includes('dummy.supabase.co')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({}),
        text: async () => "{}",
        headers: new Headers(),
      } as unknown as Response;
    }

    if (url && url.includes('/api/')) {
      let mockData: any = [];
      const queryString = url.split('?')[1];
      let filterDay: string | null = null;
      let filterLogDate: string | null = null;
      if (queryString) {
        const params = new URLSearchParams(queryString);
        filterDay = params.get('day');
        filterLogDate = params.get('log_date');
      }
      
      if (url.includes('/api/meals')) {
        let fullMockData = mockMealsData.map((m: any) => ({
          ...m,
          calories: parseInt(m.calories) || 0,
          protein_g: parseInt(m.protein_g) || 0,
          carbs_g: parseInt(m.carbs_g) || 0,
          fat_g: parseInt(m.fat_g) || 0,
          fiber_g: parseInt(m.fiber_g) || 0,
          image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        }));
        
        if (filterDay) {
          mockData = fullMockData.filter(m => m.day && m.day.toUpperCase() === filterDay.toUpperCase());
        } else {
          mockData = fullMockData;
        }
        
      } else if (url.includes('/api/ratings')) {
        mockData = mockRatingsData.map((r: any) => ({
          ...r,
          rating: parseInt(r.rating) || 0,
          preference_value: parseInt(r.preference_value) || 0,
        }));
        if (filterLogDate) mockData = mockData.filter((r: any) => r.log_date === filterLogDate);

      } else if (url.includes('/api/preferences')) {
        mockData = mockPrefsData.map((p: any) => ({
          ...p,
          preference_value: parseInt(p.preference_value) || 0,
        }));
        if (filterLogDate) mockData = mockData.filter((p: any) => p.log_date === filterLogDate);

      } else if (url.includes('/api/profile')) {
        mockData = mockProfilesData.length > 0 ? mockProfilesData[0] : { id: 'mock', full_name: 'Mock User', admin: false };
      }
      
      return {
        ok: true,
        status: 200,
        json: async () => mockData,
        text: async () => JSON.stringify(mockData),
        headers: new Headers(),
      } as unknown as Response;
    }
    
    return await originalFetch(...args);
  } catch (e) {
    console.warn('[FETCH INTERCEPTOR FALLBACK]', e);
    return {
      ok: false,
      status: 500,
      json: async () => ({}),
      text: async () => "{}",
      headers: new Headers(),
    } as unknown as Response;
  }
};
// --------------------------------

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="student" />
        <Stack.Screen name="admin" />
      </Stack>
    </AuthProvider>
  );
}
