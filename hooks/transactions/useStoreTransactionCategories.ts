import {useContext} from "react";
import {v4 as uuid} from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import ErrorContext from "../../store/error-context";
import ToastContext, {Toast, ToastType} from "../../store/toast-context";

const storeCategories =
  (addToast: (toast: Toast) => void) => async (categoriesToAdd: string[]) => {
    const prevCategoryArrayString = await AsyncStorage.getItem("categories");
    const prevCategories: string[] = prevCategoryArrayString
      ? JSON.parse(prevCategoryArrayString)
      : [];

    const processedCategories = prevCategories.map(category =>
      category.trim().toLowerCase()
    );

    const {commonCategories, newCategories} = categoriesToAdd.reduce<{
      commonCategories: string[];
      newCategories: string[];
    }>(
      (prevCategoryObject, category) => {
        const newCategory = category.trim();
        return processedCategories.includes(newCategory.toLowerCase())
          ? {
              ...prevCategoryObject,
              commonCategories: [
                ...prevCategoryObject.commonCategories,
                newCategory
              ]
            }
          : {
              ...prevCategoryObject,
              newCategories: [...prevCategoryObject.newCategories, newCategory]
            };
      },
      {commonCategories: [], newCategories: []}
    );

    if (commonCategories.length)
      addToast({
        id: uuid(),
        message: `${commonCategories.join(
          " and "
        )} already exist(s). Please choose unique category names.`,
        type: ToastType.WARNING
      });

    if (newCategories.length)
      await AsyncStorage.setItem(
        "categories",
        JSON.stringify([...prevCategories, ...newCategories])
      );

    return newCategories;
  };

const useStoreTransactionCategories = () => {
  const queryClient = useQueryClient();
  const {addError, removeError} = useContext(ErrorContext);
  const {addToast} = useContext(ToastContext);

  return useMutation({
    mutationFn: storeCategories(addToast),
    // Always refetch all transaction categories after success or error
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactionCategories"]
      });
    },
    onError: error =>
      addError({
        id: "useStoreTransactionCategories",
        error: "AsyncStorage - Store transaction categories",
        errorMessage: `There was a problem storing the transaction categories in AsyncStorage: ${JSON.stringify(
          error
        )}`
      }),
    onSuccess: () => removeError("useStoreTransactionCategories")
  });
};

export default useStoreTransactionCategories;
