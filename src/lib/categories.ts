export const CATEGORIES = [
  { value: 'crown_bridge', label: 'Crown & Bridge Design', short: 'Crown & Bridge' },
  { value: 'veneers_dsd', label: 'Veneers & Digital Smile Design', short: 'Veneers & DSD' },
  { value: 'surgical_guides', label: 'Surgical Guides', short: 'Surgical Guides' },
  { value: 'exocad', label: 'Exocad Workflows', short: 'Exocad' },
] as const;

export type CategoryValue = typeof CATEGORIES[number]['value'];

export const categoryLabel = (v: string) =>
  CATEGORIES.find((c) => c.value === v)?.label ?? v;
