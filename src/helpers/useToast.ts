import { useToastState } from "../components/ui/Toast";

/**
 * Hook to add a toast message
 * @example
 * const toast = useToast();
 * toast("Hello, world!");
 */
export function useToast() {
  return useToastState().addToast;
}
