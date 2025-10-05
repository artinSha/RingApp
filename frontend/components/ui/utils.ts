// React Native utility functions

// Combine styles utility for React Native
export function combineStyles(...styles: any[]) {
  return styles.filter(Boolean).flat();
}

// Color utility functions
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Spacing utility
export function spacing(size: number): number {
  return size * 4; // 4px base unit
}

// Typography utility
export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const },
  h2: { fontSize: 24, fontWeight: '600' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
};

// Colors
export const colors = {
  primary: '#fb923c',
  secondary: 'rgba(75, 85, 99, 0.6)',
  background: '#111827',
  card: 'rgba(31, 41, 55, 0.6)',
  text: '#f9fafb',
  textMuted: '#9ca3af',
  border: 'rgba(75, 85, 99, 0.6)',
  success: '#22c55e',
  warning: '#fb923c',
  error: '#ef4444',
};
