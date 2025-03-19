import { createContext, use, useState } from "react";

// import styles from "./Toast.module.css";

type Toast = {
  id: string;
  message: string;
};

type ToastContextValue = {
  toasts: Toast[];
  addToast: (message: string) => string;
  removeToast: (id: string) => void;
};

const TOAST_DURATION = 10_000;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function addToast(message: string) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, addedAt: new Date() }]);

    setTimeout(() => {
      removeToast(id);
    }, TOAST_DURATION);

    return id;
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToastState() {
  const value = use(ToastContext);

  if (!value) {
    throw new Error("useToaster must be used within a ToastProvider");
  }

  return value;
}

function Toast() {
  // need to implement this
  return <div />;
}

export function Toaster() {
  // and this
  return <div />;
}
