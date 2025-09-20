/**
 * Utility functions for formatting data
 */

/**
 * Format number with Vietnamese currency format (dots as thousand separators)
 * @param value - The number to format
 * @returns Formatted string with dots as thousand separators
 *
 * @example
 * formatCurrency(2500000000) // "2.500.000.000"
 * formatCurrency(1500000) // "1.500.000"
 * formatCurrency(750000) // "750.000"
 */
export const formatCurrency = (value: number | string): string => {
  // Convert to number if string
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  // Check if valid number
  if (isNaN(numValue)) {
    return "0";
  }

  // Format with dots as thousand separators
  return numValue.toLocaleString("vi-VN");
};

/**
 * Parse formatted currency string back to number
 * @param formattedValue - Formatted string with dots
 * @returns Number value
 *
 * @example
 * parseCurrency("2.500.000.000") // 2500000000
 * parseCurrency("1.500.000") // 1500000
 */
export const parseCurrency = (formattedValue: string): number => {
  // Remove all dots and convert to number
  const cleanValue = formattedValue.replace(/\./g, "");
  return parseFloat(cleanValue) || 0;
};

/**
 * Format area with 2 decimal places and m² unit
 * @param value - The area value to format
 * @returns Formatted area string
 *
 * @example
 * formatArea(75.5) // "75,50 m²"
 * formatArea(120) // "120,00 m²"
 */
export const formatArea = (value: number | string): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return "0,00 m²";
  }

  return `${numValue.toLocaleString("vi-VN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} m²`;
};

/**
 * Format percentage with % symbol
 * @param value - The percentage value to format
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(15.5) // "15,5%"
 * formatPercentage(100) // "100%"
 */
export const formatPercentage = (value: number | string): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return "0%";
  }

  return `${numValue.toLocaleString("vi-VN")}%`;
};

/**
 * Format date to Vietnamese format
 * @param date - Date object or date string
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date()) // "25/12/2024"
 * formatDate("2024-12-25") // "25/12/2024"
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "";
  }

  return dateObj.toLocaleDateString("vi-VN");
};

/**
 * Format date and time to Vietnamese format
 * @param date - Date object or date string
 * @returns Formatted datetime string
 *
 * @example
 * formatDateTime(new Date()) // "25/12/2024, 14:30"
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "";
  }

  return dateObj.toLocaleString("vi-VN");
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 *
 * @example
 * truncateText("This is a very long text", 10) // "This is a..."
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + "...";
};

/**
 * Capitalize first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 *
 * @example
 * capitalizeWords("hello world") // "Hello World"
 */
export const capitalizeWords = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
