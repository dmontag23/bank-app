import React, {createContext, useContext, useState} from "react";

import ToastContext, {ToastType} from "./toast-context";

import {AppError} from "../types/errors";

export const defaultErrorContext = {
  errors: [],
  addError: () => {},
  removeError: () => {},
  errorModal: {
    isVisible: false,
    showModal: () => {},
    hideModal: () => {}
  }
};

const ErrorContext = createContext<{
  errors: AppError[];
  addError: (error: AppError) => void;
  removeError: (errorId: string) => void;
  errorModal: {
    isVisible: boolean;
    showModal: (errorId?: string) => void;
    hideModal: () => void;
    selectedErrorId?: string;
  };
}>(defaultErrorContext);

type ErrorContextProviderProps = {
  children: React.ReactNode;
};

export const ErrorContextProvider = ({children}: ErrorContextProviderProps) => {
  const {addToast, clearAllToasts} = useContext(ToastContext);

  const [errors, setErrors] = useState<AppError[]>([]);

  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [selectedErrorId, setSelectedErrorId] = useState<string>();

  const showErrorModal = (id?: string) => {
    setSelectedErrorId(id);
    setIsErrorModalVisible(true);
  };
  const hideErrorModal = () => setIsErrorModalVisible(false);

  const addError = (error: AppError) => {
    setErrors(prevErrors => [...prevErrors, error]);
    if (!isErrorModalVisible)
      addToast({
        id: error.id,
        message: `An error occurred: ${error.error}`,
        type: ToastType.ERROR,
        action: {
          label: "Show details",
          onPress: () => {
            showErrorModal(error.id);
            clearAllToasts();
          }
        }
      });
  };

  const removeError = (errorId: string) =>
    setErrors(prevErrors => prevErrors.filter(({id}) => id !== errorId));

  return (
    <ErrorContext.Provider
      value={{
        errors,
        addError,
        removeError,
        errorModal: {
          isVisible: isErrorModalVisible,
          showModal: showErrorModal,
          hideModal: hideErrorModal,
          selectedErrorId
        }
      }}>
      {children}
    </ErrorContext.Provider>
  );
};

export default ErrorContext;
