import {useContext} from "react";
import {v4 as uuid} from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import ErrorContext from "../../store/error-context";
import ToastContext, {Toast, ToastType} from "../../store/toast-context";

const storeCategory =
  (addToast: (toast: Toast) => void) => async (newCategory: string) => {
    const categoryArrayString = await AsyncStorage.getItem("categories");
    const categories: string[] = categoryArrayString
      ? JSON.parse(categoryArrayString)
      : [];

    const newCategoryTrimmed = newCategory.trim();

    !categories
      .map(item => item.trim().toLowerCase())
      .includes(newCategoryTrimmed.toLowerCase())
      ? await AsyncStorage.setItem(
          "categories",
          JSON.stringify([...categories, newCategoryTrimmed])
        )
      : addToast({
          id: uuid(),
          message: `${newCategoryTrimmed} is already a category. Please choose a new name.`,
          type: ToastType.WARNING
        });
    return newCategoryTrimmed;
  };

const useStoreTransactionCategory = () => {
  const queryClient = useQueryClient();
  const {addError, removeError} = useContext(ErrorContext);
  const {addToast} = useContext(ToastContext);

  return useMutation({
    mutationFn: storeCategory(addToast),
    // Always refetch all transaction categories after success or error
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactionCategories"]
      });
    },
    onError: error =>
      addError({
        id: "useStoreTransactionCategory",
        error: "AsyncStorage - Store transaction category",
        errorMessage: `There was a problem storing the transaction category in AsyncStorage: ${JSON.stringify(
          error
        )}`
      }),
    onSuccess: () => removeError("useStoreTransactionCategory")
  });
};

export default useStoreTransactionCategory;
