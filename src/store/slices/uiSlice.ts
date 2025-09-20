import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  loading: {
    global: boolean;
    projects: boolean;
    apartments: boolean;
  };
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
    timestamp: number;
  }>;
  modals: {
    projectCreate: boolean;
    apartmentCreate: boolean;
    projectEdit: boolean;
    apartmentEdit: boolean;
    deleteConfirm: boolean;
  };
  selectedItems: {
    projects: string[];
    apartments: string[];
  };
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: "light",
  loading: {
    global: false,
    projects: false,
    apartments: false,
  },
  notifications: [],
  modals: {
    projectCreate: false,
    apartmentCreate: false,
    projectEdit: false,
    apartmentEdit: false,
    deleteConfirm: false,
  },
  selectedItems: {
    projects: [],
    apartments: [],
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
    setLoading: (
      state,
      action: PayloadAction<{ key: keyof UIState["loading"]; value: boolean }>
    ) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    addNotification: (
      state,
      action: PayloadAction<
        Omit<UIState["notifications"][0], "id" | "timestamp">
      >
    ) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setModalOpen: (
      state,
      action: PayloadAction<{ modal: keyof UIState["modals"]; open: boolean }>
    ) => {
      state.modals[action.payload.modal] = action.payload.open;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key as keyof UIState["modals"]] = false;
      });
    },
    setSelectedItems: (
      state,
      action: PayloadAction<{
        type: "projects" | "apartments";
        items: string[];
      }>
    ) => {
      state.selectedItems[action.payload.type] = action.payload.items;
    },
    toggleSelectedItem: (
      state,
      action: PayloadAction<{ type: "projects" | "apartments"; itemId: string }>
    ) => {
      const { type, itemId } = action.payload;
      const currentItems = state.selectedItems[type];
      const index = currentItems.indexOf(itemId);

      if (index > -1) {
        currentItems.splice(index, 1);
      } else {
        currentItems.push(itemId);
      }
    },
    clearSelectedItems: (
      state,
      action: PayloadAction<"projects" | "apartments">
    ) => {
      state.selectedItems[action.payload] = [];
    },
    clearAllSelectedItems: (state) => {
      state.selectedItems.projects = [];
      state.selectedItems.apartments = [];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  setModalOpen,
  closeAllModals,
  setSelectedItems,
  toggleSelectedItem,
  clearSelectedItems,
  clearAllSelectedItems,
} = uiSlice.actions;

export default uiSlice.reducer;
