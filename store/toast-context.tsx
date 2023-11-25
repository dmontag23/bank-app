import React, {createContext, useState} from "react";
import {Button} from "react-native-paper";
import {$RemoveChildren} from "react-native-paper/lib/typescript/types";

export enum ToastType {
  LOG = "LOG",
  WARNING = "WARNING",
  ERROR = "ERROR"
}

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
  // the type below comes from https://callstack.github.io/react-native-paper/docs/components/Snackbar
  action?: $RemoveChildren<typeof Button> & {label: string};
};

const ToastContext = createContext<{
  toasts: Toast[];
  addToast: (toast: Toast) => void;
  clearToast: (toastId: string) => void;
  clearAllToasts: () => void;
}>({
  toasts: [],
  addToast: () => {},
  clearToast: () => {},
  clearAllToasts: () => {}
});

type ToastContextProviderProps = {
  children: React.ReactNode;
};

export const ToastContextProvider = ({children}: ToastContextProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Toast) =>
    setToasts(prevToasts => [...prevToasts, toast]);

  const clearToast = (toastId: string) =>
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== toastId));

  const clearAllToasts = () => setToasts([]);

  return (
    <ToastContext.Provider
      value={{toasts, addToast, clearToast, clearAllToasts}}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastContext;
