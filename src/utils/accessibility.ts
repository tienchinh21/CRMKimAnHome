export function getContrastRatio(foreground: string, background: string): number {
  const fgLum = getRelativeLuminance(foreground);
  const bgLum = getRelativeLuminance(background);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = rgb.map((val) => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}


function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
}


export function meetsWCAGStandard(ratio: number, level: 'AA' | 'AAA' = 'AA'): boolean {
  const minRatio = level === 'AA' ? 4.5 : 7;
  return ratio >= minRatio;
}


export function generateAriaLabel(value: string | number, label: string): string {
  return `${label}: ${value}`;
}


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


export function createAccessibleTooltip(content: string, id: string) {
  return {
    'aria-describedby': id,
    role: 'tooltip',
  };
}


export function createAccessibleButton(label: string, disabled = false) {
  return {
    'aria-label': label,
    'aria-disabled': disabled,
    role: 'button',
  };
}

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

export function createAccessibleLoadingState(isLoading: boolean, message = 'Loading') {
  return {
    'aria-busy': isLoading,
    'aria-label': isLoading ? message : undefined,
    role: 'status',
  };
}

export function createAccessibleErrorState(error: string | null, id: string) {
  return {
    'aria-invalid': !!error,
    'aria-describedby': error ? id : undefined,
    role: 'alert',
  };
}

export function createSkipToMainLink() {
  return {
    href: '#main-content',
    className: 'sr-only focus:not-sr-only',
    children: 'Skip to main content',
  };
}

export const srOnlyClass = 'sr-only';


export function createAccessibleChart(title: string, description?: string) {
  return {
    role: 'img',
    'aria-label': title,
    'aria-describedby': description ? 'chart-description' : undefined,
  };
}

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

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}


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

