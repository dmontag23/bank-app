import {useContext} from "react";
import {v4 as uuid} from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import ErrorContext from "../../store/error-context";
import ToastContext, {Toast, ToastType} from "../../store/toast-context";
import {CategoryMap} from "../../types/transaction";

const storeCategories =
  (addToast: (toast: Toast) => void) =>
  async (categoriesToAdd: CategoryMap) => {
    const prevCategoryMapString = await AsyncStorage.getItem("categories");
    const prevCategoryMap: CategoryMap = prevCategoryMapString
      ? JSON.parse(prevCategoryMapString)
      : {};

    const prevCategoryNames = Object.keys(prevCategoryMap).map(category =>
      category.trim().toLowerCase()
    );

    const newCategoryNames = Object.keys(categoriesToAdd);

    const {commonCategoryNames, newCategories} = newCategoryNames.reduce<{
      commonCategoryNames: string[];
      newCategories: CategoryMap;
    }>(
      (prevCategoryObject, newCategory) => {
        const trimmedCategoryName = newCategory.trim();
        return prevCategoryNames.includes(trimmedCategoryName.toLowerCase())
          ? {
              ...prevCategoryObject,
              commonCategoryNames: [
                ...prevCategoryObject.commonCategoryNames,
                trimmedCategoryName
              ]
            }
          : {
              ...prevCategoryObject,
              newCategories: {
                ...prevCategoryObject.newCategories,
                [trimmedCategoryName]: categoriesToAdd[newCategory]
              }
            };
      },
      {commonCategoryNames: [], newCategories: {}}
    );

    if (commonCategoryNames.length)
      addToast({
        id: uuid(),
        message: `${commonCategoryNames.join(
          " and "
        )} already exist(s). Please choose unique category names.`,
        type: ToastType.WARNING
      });

    if (Object.keys(newCategories).length)
      await AsyncStorage.setItem(
        "categories",
        JSON.stringify({...prevCategoryMap, ...newCategories})
      );

    return newCategories;
  };

const useStoreCategories = () => {
  const queryClient = useQueryClient();
  const {addError, removeError} = useContext(ErrorContext);
  const {addToast} = useContext(ToastContext);

  return useMutation({
    mutationFn: storeCategories(addToast),
    // Always refetch all categories after success or error
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"]
      });
    },
    onError: error =>
      addError({
        id: "useStoreCategories",
        error: "AsyncStorage - Store categories",
        errorMessage: `There was a problem storing the categories in AsyncStorage: ${JSON.stringify(
          error
        )}`
      }),
    onSuccess: () => removeError("useStoreCategories")
  });
};

export default useStoreCategories;
