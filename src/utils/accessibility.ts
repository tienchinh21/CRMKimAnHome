/**
 * Accessibility Utilities
 * Helper functions for WCAG AA compliance
 */

/**
 * Check if color contrast meets WCAG AA standards
 * @param foreground - Foreground color in hex
 * @param background - Background color in hex
 * @returns Contrast ratio
 */
export function getContrastRatio(foreground: string, background: string): number {
  const fgLum = getRelativeLuminance(foreground);
  const bgLum = getRelativeLuminance(background);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate relative luminance of a color
 * @param hex - Color in hex format
 * @returns Relative luminance value
 */
function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = rgb.map((val) => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 * @param hex - Color in hex format
 * @returns RGB array or null
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
}

/**
 * Check if contrast ratio meets WCAG AA standards
 * @param ratio - Contrast ratio
 * @param level - 'AA' or 'AAA'
 * @returns true if meets standard
 */
export function meetsWCAGStandard(ratio: number, level: 'AA' | 'AAA' = 'AA'): boolean {
  const minRatio = level === 'AA' ? 4.5 : 7;
  return ratio >= minRatio;
}

/**
 * Generate accessible label for screen readers
 * @param value - The value to display
 * @param label - The label for the value
 * @returns Accessible label string
 */
export function generateAriaLabel(value: string | number, label: string): string {
  return `${label}: ${value}`;
}

/**
 * Format number for accessibility
 * @param value - Number to format
 * @param options - Formatting options
 * @returns Formatted string
 */
export function formatNumberAccessible(
  value: number,
  options?: {
    style?: 'decimal' | 'currency' | 'percent';
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  return new Intl.NumberFormat('vi-VN', {
    style: options?.style || 'decimal',
    currency: options?.currency || 'VND',
    minimumFractionDigits: options?.minimumFractionDigits || 0,
    maximumFractionDigits: options?.maximumFractionDigits || 2,
  }).format(value);
}

/**
 * Create accessible tooltip
 * @param content - Tooltip content
 * @param id - Unique ID for the tooltip
 * @returns Object with aria attributes
 */
export function createAccessibleTooltip(content: string, id: string) {
  return {
    'aria-describedby': id,
    role: 'tooltip',
  };
}

/**
 * Create accessible button attributes
 * @param label - Button label
 * @param disabled - Is button disabled
 * @returns Object with aria attributes
 */
export function createAccessibleButton(label: string, disabled = false) {
  return {
    'aria-label': label,
    'aria-disabled': disabled,
    role: 'button',
  };
}

/**
 * Create accessible table header
 * @param label - Header label
 * @param sortable - Is column sortable
 * @param sorted - Sort direction ('asc', 'desc', or null)
 * @returns Object with aria attributes
 */
export function createAccessibleTableHeader(
  label: string,
  sortable = false,
  sorted: 'asc' | 'desc' | null = null
) {
  return {
    'aria-label': label,
    'aria-sort': sortable ? (sorted ? `${sorted}ending` : 'none') : undefined,
    role: 'columnheader',
  };
}

/**
 * Create accessible loading state
 * @param isLoading - Is loading
 * @param message - Loading message
 * @returns Object with aria attributes
 */
export function createAccessibleLoadingState(isLoading: boolean, message = 'Loading') {
  return {
    'aria-busy': isLoading,
    'aria-label': isLoading ? message : undefined,
    role: 'status',
  };
}

/**
 * Create accessible error state
 * @param error - Error message
 * @param id - Unique ID for error
 * @returns Object with aria attributes
 */
export function createAccessibleErrorState(error: string | null, id: string) {
  return {
    'aria-invalid': !!error,
    'aria-describedby': error ? id : undefined,
    role: 'alert',
  };
}

/**
 * Skip to main content link
 * Used for keyboard navigation
 */
export function createSkipToMainLink() {
  return {
    href: '#main-content',
    className: 'sr-only focus:not-sr-only',
    children: 'Skip to main content',
  };
}

/**
 * Screen reader only class
 * Hides content visually but keeps it for screen readers
 */
export const srOnlyClass = 'sr-only';

/**
 * Create accessible chart
 * @param title - Chart title
 * @param description - Chart description
 * @returns Object with aria attributes
 */
export function createAccessibleChart(title: string, description?: string) {
  return {
    role: 'img',
    'aria-label': title,
    'aria-describedby': description ? 'chart-description' : undefined,
  };
}

/**
 * Announce message to screen readers
 * @param message - Message to announce
 * @param priority - 'polite' or 'assertive'
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if user prefers reduced motion
 * @returns true if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers dark mode
 * @returns true if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Check if user prefers high contrast
 * @returns true if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: more)').matches;
}

export default {
  getContrastRatio,
  meetsWCAGStandard,
  generateAriaLabel,
  formatNumberAccessible,
  createAccessibleTooltip,
  createAccessibleButton,
  createAccessibleTableHeader,
  createAccessibleLoadingState,
  createAccessibleErrorState,
  createSkipToMainLink,
  createAccessibleChart,
  announceToScreenReader,
  prefersReducedMotion,
  prefersDarkMode,
  prefersHighContrast,
};

