// Animation constants
export const ANIMATION_CONFIG = {
  SPRING: {
    damping: 15,
    stiffness: 120,
  },
  SPRING_STIFF: {
    damping: 15,
    stiffness: 150,
  },
  TIMING: {
    duration: 500,
    delay: 100,
  },
} as const;

// Color constants
export const COLORS = {
  PRIMARY: '#3B5A7A',
  SECONDARY: '#4A4A4A',
  SECONDARY_OPACITY: '#4A4A4A/50',
  TEXT: '#4A4A4A',
} as const;

// Layout constants
export const LAYOUT = {
  WEEK_DAYS: 7,
  CALENDAR_ITEM_SIZE: 36, // w-9 h-9 = 36px
  SCROLL_PADDING_BOTTOM: 30,
} as const;

// Day labels for calendar
export const DAY_LABELS = ["S", "M", "T", "W", "Th", "F", "S"] as const;

// Week configuration
export const WEEK_CONFIG = {
  weekStartsOn: 0, // Sunday
} as const; 