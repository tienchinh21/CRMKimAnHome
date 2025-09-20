/**
 * Modern Teal/Cyan Theme System
 * Professional, harmonious, and modern
 */

// Theme configuration
export const THEME = {
  // Primary colors
  primary: "#14b8a6", // Teal
  secondary: "#f0fdfa", // Very light teal
  muted: "#a3a3a3", // Medium gray

  // Background colors
  background: "#ffffff", // White
  surface: "#ffffff", // White for cards/surfaces

  // Text colors
  text: "#1a202c", // Dark blue-gray
  textMuted: "#6b7280", // Medium gray

  // Border colors
  border: "#e5e7eb", // Light teal borders
  borderFocus: "#14b8a6", // Teal focus borders

  // Status colors
  success: "#10b981", // Green
  warning: "#f59e0b", // Amber
  error: "#ef4444", // Red
  info: "#06b6d4", // Cyan
} as const;

// Utility functions for consistent color usage
export const getColor = (colorKey: keyof typeof THEME): string => {
  return THEME[colorKey];
};

// Common color combinations
export const COLOR_COMBINATIONS = {
  // Button styles
  primaryButton: {
    background: THEME.primary,
    text: "#ffffff",
    hover: "#0d9488", // Darker teal
  },
  secondaryButton: {
    background: THEME.secondary,
    text: THEME.text,
    hover: "#ccfbf1", // Lighter teal
  },
  outlineButton: {
    background: "transparent",
    text: THEME.primary,
    border: THEME.primary,
    hover: THEME.primary,
    hoverText: "#ffffff",
  },

  // Card styles
  card: {
    background: THEME.surface,
    text: THEME.text,
    border: THEME.border,
    shadow: "0 1px 3px 0 rgba(20, 184, 166, 0.1)",
  },

  // Input styles
  input: {
    background: THEME.background,
    text: THEME.text,
    border: THEME.border,
    focusBorder: THEME.borderFocus,
    placeholder: THEME.textMuted,
  },

  // Status badges
  status: {
    success: {
      background: "#dcfce7", // Green-100
      text: "#166534", // Green-800
      border: "#bbf7d0", // Green-200
    },
    warning: {
      background: "#fef3c7", // Amber-100
      text: "#92400e", // Amber-800
      border: "#fde68a", // Amber-200
    },
    error: {
      background: "#fee2e2", // Red-100
      text: "#991b1b", // Red-800
      border: "#fecaca", // Red-200
    },
    info: {
      background: "#cffafe", // Cyan-100
      text: "#155e75", // Cyan-800
      border: "#a5f3fc", // Cyan-200
    },
  },
} as const;

// CSS class generators for consistent styling
export const getButtonClasses = (
  variant: "primary" | "secondary" | "outline" | "ghost" = "primary"
) => {
  const baseClasses =
    "px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  switch (variant) {
    case "primary":
      return `${baseClasses} bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-sm hover:shadow-md`;
    case "secondary":
      return `${baseClasses} bg-teal-50 text-teal-700 hover:bg-teal-100 focus:ring-teal-500`;
    case "outline":
      return `${baseClasses} border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white focus:ring-teal-500`;
    case "ghost":
      return `${baseClasses} text-teal-600 hover:bg-teal-50 focus:ring-teal-500`;
    default:
      return baseClasses;
  }
};

export const getCardClasses = () => {
  return "bg-white border border-teal-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200";
};

export const getInputClasses = () => {
  return "w-full px-4 py-3 rounded-lg border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-white";
};

export const getBadgeClasses = (
  status: "success" | "warning" | "error" | "info"
) => {
  const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";

  switch (status) {
    case "success":
      return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
    case "warning":
      return `${baseClasses} bg-amber-100 text-amber-800 border border-amber-200`;
    case "error":
      return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
    case "info":
      return `${baseClasses} bg-cyan-100 text-cyan-800 border border-cyan-200`;
    default:
      return `${baseClasses} bg-teal-100 text-teal-800 border border-teal-200`;
  }
};

// Export theme for easy access
export default THEME;
