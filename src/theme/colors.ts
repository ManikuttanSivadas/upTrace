export const DARK_COLORS = {
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceLight: '#222222',
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#8B5CF6',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  success: '#10B981',
  successDark: '#059669',
  danger: '#EF4444',
  dangerDark: '#DC2626',
  border: '#2A2A2A',
  accent: '#F59E0B',
};

export const LIGHT_COLORS = {
  background: '#FFFFFF',
  surface: '#F3F4F6',
  surfaceLight: '#F9FAFB',
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#8B5CF6',
  textPrimary: '#18181B',
  textSecondary: '#52525B',
  success: '#10B981',
  successDark: '#059669',
  danger: '#EF4444',
  dangerDark: '#DC2626',
  border: '#E5E7EB',
  accent: '#F59E0B',
};

export function getColors(isDark: boolean) {
  return isDark ? DARK_COLORS : LIGHT_COLORS;
}

// For backward compatibility
export const COLORS = DARK_COLORS;
