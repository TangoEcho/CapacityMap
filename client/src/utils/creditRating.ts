const RATING_SCALE: Record<string, number> = {
  'AAA': 10,
  'AA+': 9, 'Aa1': 9,
  'AA': 8.5, 'Aa2': 8.5,
  'AA-': 8, 'Aa3': 8,
  'A+': 7.5, 'A1': 7.5,
  'A': 7, 'A2': 7,
  'A-': 6.5, 'A3': 6.5,
  'BBB+': 6, 'Baa1': 6,
  'BBB': 5.5, 'Baa2': 5.5,
  'BBB-': 5, 'Baa3': 5,
  'BB+': 4.5, 'Ba1': 4.5,
  'BB': 4, 'Ba2': 4,
  'BB-': 3.5, 'Ba3': 3.5,
  'B+': 3, 'B1': 3,
  'B': 2.5, 'B2': 2.5,
  'B-': 2, 'B3': 2,
  'CCC+': 1.5, 'Caa1': 1.5,
  'CCC': 1, 'Caa2': 1,
  'CCC-': 0.5, 'Caa3': 0.5,
  'D': 0,
};

export function ratingToScore(rating?: string): number {
  if (!rating) return 5; // Default middle score
  return RATING_SCALE[rating] ?? 5;
}

export function meetsMinimumRating(bankRating?: string, minimumRating?: string): boolean {
  if (!minimumRating) return true;
  if (!bankRating) return false;
  return ratingToScore(bankRating) >= ratingToScore(minimumRating);
}

export const CREDIT_RATINGS = [
  'AAA', 'AA+', 'AA', 'AA-',
  'A+', 'A', 'A-',
  'BBB+', 'BBB', 'BBB-',
  'BB+', 'BB', 'BB-',
  'B+', 'B', 'B-',
  'CCC+', 'CCC', 'CCC-',
  'D',
];

export function getRatingColor(rating?: string): { bg: string; text: string } {
  if (!rating) return { bg: '#e5e7eb', text: '#6b7280' };
  const score = ratingToScore(rating);
  if (score >= 8.5) return { bg: '#dcfce7', text: '#15803d' }; // AAA, AA+, AA — green
  if (score >= 7) return { bg: '#dbeafe', text: '#1d4ed8' };   // AA-, A+, A — blue
  if (score >= 5.5) return { bg: '#fef3c7', text: '#b45309' }; // A-, BBB+, BBB — amber
  return { bg: '#fee2e2', text: '#b91c1c' };                   // BBB- and below — red
}

export function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return '';
  const codePoints = [...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

export function formatCountryDisplay(code: string): string {
  return code === 'GLOBAL' ? 'Global' : code;
}

export function getCapacityHealth(available: number, total: number): { label: string; color: string; bg: string } {
  if (total <= 0) return { label: 'N/A', color: '#6b7280', bg: '#f3f4f6' };
  const utilization = (total - available) / total;
  if (utilization < 0.5) return { label: 'Ample', color: '#15803d', bg: '#dcfce7' };
  if (utilization < 0.8) return { label: 'Moderate', color: '#b45309', bg: '#fef3c7' };
  return { label: 'Limited', color: '#b91c1c', bg: '#fee2e2' };
}
