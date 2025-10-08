// Application Constants

// Navigation Routes
export const ROUTES = {
  // Auth routes
  LOGIN: "/auth/login",
  FORGOT_PASSWORD: "/auth/forgot-password",

  // Main app routes (dashboard is now at root)
  DASHBOARD: "/",
  PROJECTS: "/projects",
  PROJECT_DETAIL: "/projects/:id",
  APARTMENTS: "/apartments",
  APARTMENT_DETAIL: "/apartments/:id",
  CUSTOMERS: "/customers",
  DEALS: "/deals",
  STAFF: "/staff",
  BLOG_CATEGORIES: "/blog-categories",
  BLOG: "/blog",
} as const;

// Modern Teal/Cyan Color System
export const COLORS = {
  // Pure colors
  PURE_WHITE: "#ffffff",
  PURE_BLACK: "#1a202c", // Dark blue-gray instead of pure black

  // Gray scale (consistent with Tailwind)
  GRAY: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
  },

  // Teal color palette
  TEAL: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a",
  },

  // Cyan color palette
  CYAN: {
    50: "#ecfeff",
    100: "#cffafe",
    200: "#a5f3fc",
    300: "#67e8f9",
    400: "#22d3ee",
    500: "#06b6d4",
    600: "#0891b2",
    700: "#0e7490",
    800: "#155e75",
    900: "#164e63",
  },

  // Status colors
  STATUS: {
    SUCCESS: "#10b981", // Green for success
    WARNING: "#f59e0b", // Amber for warning
    ERROR: "#ef4444", // Red for error
    INFO: "#06b6d4", // Cyan for info
  },

  // Semantic colors
  SEMANTIC: {
    PRIMARY: "#14b8a6", // Teal as primary
    SECONDARY: "#f0fdfa", // Very light teal as secondary
    MUTED: "#6b7280", // Medium gray for muted text
    BORDER: "#e5e7eb", // Light teal for borders
    FOCUS: "#14b8a6", // Teal for focus states
  },
} as const;

// CSS Custom Properties for consistent theming (Light theme only)
export const CSS_VARS = {
  "--background": "0 0% 100%",
  "--foreground": "0 0% 9%",
  "--card": "0 0% 100%",
  "--card-foreground": "0 0% 9%",
  "--popover": "0 0% 100%",
  "--popover-foreground": "0 0% 9%",
  "--primary": "0 0% 9%",
  "--primary-foreground": "0 0% 98%",
  "--secondary": "0 0% 96%",
  "--secondary-foreground": "0 0% 9%",
  "--muted": "0 0% 96%",
  "--muted-foreground": "0 0% 45%",
  "--accent": "0 0% 96%",
  "--accent-foreground": "0 0% 9%",
  "--destructive": "0 84% 60%",
  "--destructive-foreground": "0 0% 98%",
  "--border": "0 0% 90%",
  "--input": "0 0% 90%",
  "--ring": "0 0% 9%",
} as const;

// Apartment Status Options (matching API byte format)
export const APARTMENT_STATUS = [
  { value: "0", label: "Còn trống" },
  { value: "1", label: "Đã bán" },
  { value: "2", label: "Đã cho thuê" },
  { value: "3", label: "Đã đặt cọc" },
  { value: "4", label: "Bảo trì" },
] as const;

// Direction Options
export const DIRECTIONS = [
  { value: "north", label: "Bắc" },
  { value: "south", label: "Nam" },
  { value: "east", label: "Đông" },
  { value: "west", label: "Tây" },
  { value: "northeast", label: "Đông Bắc" },
  { value: "northwest", label: "Tây Bắc" },
  { value: "southeast", label: "Đông Nam" },
  { value: "southwest", label: "Tây Nam" },
] as const;

// Interior Options
export const INTERIOR_OPTIONS = [
  { value: "basic", label: "Chưa nội thất" },
  { value: "full", label: "Đầy đủ" },
] as const;

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: "Trường này là bắt buộc",
  INVALID_EMAIL: "Email không hợp lệ",
  INVALID_PHONE: "Số điện thoại không hợp lệ",
  MIN_LENGTH: (min: number) => `Tối thiểu ${min} ký tự`,
  MAX_LENGTH: (max: number) => `Tối đa ${max} ký tự`,
  INVALID_NUMBER: "Vui lòng nhập số hợp lệ",
  INVALID_PRICE: "Giá không hợp lệ",
} as const;

// API Endpoints (Mock)
export const API_ENDPOINTS = {
  PROJECTS: "/api/projects",
  PROJECT_DETAILS: "/api/project-details",
  AMENITIES: "/api/amenities",
  APARTMENTS: "/api/apartments",
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  PROJECTS: "crm_projects",
  PROJECT_DETAILS: "crm_project_details",
  AMENITIES: "crm_amenities",
  APARTMENTS: "crm_apartments",
} as const;
