/**
 * Dashboard Design Tokens
 * Centralized design system for consistent styling
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Primary Colors - Blue theme
  primary: {
    light: "hsl(220, 70%, 50%)", // Professional blue
    dark: "hsl(220, 70%, 40%)", // Darker blue
  },

  // Secondary Colors - Indigo theme
  secondary: {
    light: "hsl(240, 60%, 50%)", // Indigo
    dark: "hsl(240, 60%, 40%)", // Darker indigo
  },

  // Accent Colors - Slate theme
  accent: {
    light: "hsl(210, 20%, 50%)", // Slate
    dark: "hsl(210, 20%, 40%)", // Darker slate
  },

  // Neutral Colors - Light blue theme
  neutral: {
    light: "hsl(220, 30%, 70%)", // Light blue
    dark: "hsl(220, 30%, 60%)", // Medium blue
  },

  // Muted Colors - Blue gray theme
  muted: {
    light: "hsl(220, 20%, 80%)", // Very light blue gray
    dark: "hsl(220, 20%, 70%)", // Light blue gray
  },

  // Status Colors - Professional theme
  success: "hsl(220, 70%, 50%)", // Blue for success
  warning: "#f59e0b", // Keep orange for warning
  error: "#ef4444", // Keep red for error
  info: "hsl(220, 70%, 50%)", // Blue for info

  // Semantic Colors
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  card: "hsl(var(--card))",
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Headings
  h1: "text-3xl font-bold leading-tight tracking-tight",
  h2: "text-2xl font-semibold leading-snug tracking-tight",
  h3: "text-xl font-semibold leading-snug tracking-tight",
  h4: "text-lg font-semibold leading-snug",

  // Body
  body: "text-base font-normal leading-relaxed",
  bodySmall: "text-sm font-normal leading-relaxed",
  bodyXs: "text-xs font-normal leading-relaxed",

  // Labels
  label: "text-sm font-medium leading-none",
  labelSmall: "text-xs font-medium leading-none",

  // Captions
  caption: "text-xs font-normal leading-relaxed text-muted-foreground",
};

// ============================================================================
// SPACING (4px grid)
// ============================================================================

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
};

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: "0",
  sm: "0.125rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  full: "9999px",
};

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  fast: "all 150ms ease-in-out",
  normal: "all 300ms ease-in-out",
  slow: "all 500ms ease-in-out",
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  mobile: "0px", // < 640px
  tablet: "640px", // 640px - 1024px
  desktop: "1024px", // > 1024px
  wide: "1280px", // > 1280px
};

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

export const responsive = {
  // Mobile-first breakpoints
  mobile: "@media (max-width: 639px)",
  tablet: "@media (min-width: 640px) and (max-width: 1023px)",
  desktop: "@media (min-width: 1024px)",
  wide: "@media (min-width: 1280px)",
};

// ============================================================================
// COMPONENT SIZES
// ============================================================================

export const sizes = {
  // Card sizes
  cardSmall: "280px",
  cardMedium: "360px",
  cardLarge: "480px",

  // Chart sizes
  chartSmall: "300px",
  chartMedium: "400px",
  chartLarge: "500px",

  // Button sizes
  buttonSmall: "32px",
  buttonMedium: "40px",
  buttonLarge: "48px",
};

// ============================================================================
// Z-INDEX
// ============================================================================

export const zIndex = {
  hide: "-1",
  base: "0",
  dropdown: "1000",
  sticky: "1020",
  fixed: "1030",
  backdrop: "1040",
  modal: "1050",
  popover: "1060",
  tooltip: "1070",
};

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================

export const durations = {
  instant: "0ms",
  fast: "150ms",
  normal: "300ms",
  slow: "500ms",
  slower: "700ms",
};

// ============================================================================
// CHART COLORS
// ============================================================================

export const chartColors = {
  chart1: "hsl(220, 70%, 50%)", // Primary blue
  chart2: "hsl(240, 60%, 50%)", // Indigo
  chart3: "hsl(210, 20%, 50%)", // Slate
  chart4: "hsl(220, 30%, 70%)", // Light blue
  chart5: "hsl(220, 20%, 80%)", // Very light blue gray
};

// ============================================================================
// TAILWIND CLASSES
// ============================================================================

export const tailwindClasses = {
  // Card styles
  card: "rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-shadow",
  cardHover: "hover:shadow-md hover:border-primary/50 transition-all",

  // Button styles
  button:
    "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  buttonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
  buttonSecondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/90",

  // Text styles
  textMuted: "text-muted-foreground",
  textSmall: "text-sm text-muted-foreground",

  // Layout
  container: "mx-auto px-4 sm:px-6 lg:px-8",
  grid: "grid gap-4 md:gap-6 lg:gap-8",
  gridCols2: "grid-cols-1 md:grid-cols-2",
  gridCols3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  gridCols4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",

  // Flex
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",

  // Spacing
  p4: "p-4",
  p6: "p-6",
  p8: "p-8",
  gap4: "gap-4",
  gap6: "gap-6",
  gap8: "gap-8",
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const dashboardTokens = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  breakpoints,
  responsive,
  sizes,
  zIndex,
  durations,
  chartColors,
  tailwindClasses,
};

export default dashboardTokens;
