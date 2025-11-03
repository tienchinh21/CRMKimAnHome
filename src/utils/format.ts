export const formatCurrency = (
  value: number | string | null | undefined
): string => {
  if (value === null || value === undefined) {
    return "0";
  }

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return "0";
  }

  return numValue.toLocaleString("vi-VN");
};

export const parseCurrency = (formattedValue: string): number => {
  // Remove all dots and convert to number
  const cleanValue = formattedValue.replace(/\./g, "");
  return parseFloat(cleanValue) || 0;
};

export const formatArea = (
  value: number | string | null | undefined
): string => {
  if (value === null || value === undefined) {
    return "0,00 m²";
  }

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return "0,00 m²";
  }

  return `${numValue.toLocaleString("vi-VN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} m²`;
};

export const formatPercentage = (
  value: number | string | null | undefined
): string => {
  if (value === null || value === undefined) {
    return "0%";
  }

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return "0%";
  }

  return `${numValue.toLocaleString("vi-VN")}%`;
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "";
  }

  return dateObj.toLocaleDateString("vi-VN");
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "";
  }

  const vietnamTime = new Date(
    dateObj.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );

  const day = String(vietnamTime.getDate()).padStart(2, "0");
  const month = String(vietnamTime.getMonth() + 1).padStart(2, "0");
  const year = vietnamTime.getFullYear();
  const hours = String(vietnamTime.getHours()).padStart(2, "0");
  const minutes = String(vietnamTime.getMinutes()).padStart(2, "0");
  const seconds = String(vietnamTime.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + "...";
};

export const capitalizeWords = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
