// Shared UI design tokens for consistent styling across screens
export const GRADIENT_BG = ["#EFF6FF", "#E0E7FF"]; // light blue -> indigo hint
export const CARD_RADIUS = 22;
export const CARD_BORDER = '#F1F5F9';
export const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 4,
};
export const HEADER_TITLE_COLOR = '#111827';
export const HEADER_SUBTITLE_COLOR = '#6B7280';
export const SURFACE_BG = '#ffffff';
export const DANGER = '#DC2626';
export const PRIMARY = '#2563EB';
export const SUCCESS = '#16A34A';
export const WARNING = '#CA8A04';
export const INDIGO = '#4F46E5';
export const MUTED_TEXT = '#6B7280';
export const SOFT_BG = '#F9FAFB';

export const priorityTokens = {
  high: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', label: 'Alta' },
  medium: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', label: 'Média' },
  low: { bg: '#DCFCE7', text: '#166534', border: '#86EFAC', label: 'Baixa' },
};
