import { useAppDispatch, useAppSelector } from "@/store";

// Re-export typed hooks for convenience
export { useAppDispatch, useAppSelector };

// Custom hooks for specific slices
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  return { ...auth, dispatch };
};

export const useUI = () => {
  const dispatch = useAppDispatch();
  const ui = useAppSelector((state) => state.ui);
  return { ...ui, dispatch };
};
