export const COLORS = {
  primary: '#059669',
  primaryHover: '#047857',
  primaryActive: '#065F46',
  primaryLight: '#D1FAE5',
  background: '#FFFFFF',
  backgroundSubtle: '#F8FAF9',
  backgroundMuted: '#F0FDF4',
  textPrimary: '#022C22',
  textSecondary: '#064E3B',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',
  border: '#E2E8F0',
  borderFocus: '#10B981',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  star: '#F59E0B',
  cardBg: '#FFFFFF',
  darkCard: '#022C22',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 100,
};

export const FONTS = {
  h1: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -1 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.5 },
  h3: { fontSize: 20, fontWeight: '600' as const },
  h4: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '500' as const },
  bodySmall: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1 },
  overline: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 1.5, textTransform: 'uppercase' as const },
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const MEAL_IMAGES: Record<string, string> = {
  breakfast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop',
  lunch: 'https://images.unsplash.com/photo-1676300186673-615bcc8d5d68?w=400&h=300&fit=crop',
  dinner: 'https://images.unsplash.com/photo-1605719161691-5d9771fc144f?w=400&h=300&fit=crop',
  snack: 'https://images.pexels.com/photos/28674547/pexels-photo-28674547.jpeg?auto=compress&w=400&h=300&fit=crop',
  default: 'https://images.unsplash.com/photo-1625485617425-4eb8ed7d82d4?w=400&h=300&fit=crop',
};
