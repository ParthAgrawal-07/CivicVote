// frontend/src/utils/constants.js

export const CATEGORIES = {
  PRESIDENT_VP: 'Student President / VP',
  CLUB_HEAD:    'Club / Committee Heads',
  CLASS_REP:    'Class Representatives',
};

export const CATEGORY_FILTERS = [
  { value: 'all',          label: 'All Elections' },
  { value: 'PRESIDENT_VP', label: 'President / VP' },
  { value: 'CLUB_HEAD',    label: 'Club Heads' },
  { value: 'CLASS_REP',    label: 'Class Reps' },
];

export const AVATAR_COLORS = [
  { bg: '#dce8f5', text: '#1a3a5c' },
  { bg: '#cfe8de', text: '#0f4a30' },
  { bg: '#f5e0d0', text: '#5a2800' },
  { bg: '#e8daf5', text: '#3a1a5c' },
  { bg: '#f5dce0', text: '#5c1a20' },
  { bg: '#daf5ee', text: '#0f4a3a' },
];

export const BAR_COLORS = [
  '#2e6da4', // blue
  '#2da875', // teal
  '#b5862a', // gold
  '#e05c4a', // red
  '#7a6de0', // purple
];

export const LOG_TYPE_STYLES = {
  VOTE:  { bg: '#e6f4ed', color: '#1d7a4f', icon: 'check' },
  ADMIN: { bg: '#e8f0f8', color: '#1a3a5c', icon: 'shield' },
  WARN:  { bg: '#fcecea', color: '#c0392b', icon: 'alert' },
  SYS:   { bg: '#f2f1ed', color: '#8a8a85', icon: 'clock' },
};
