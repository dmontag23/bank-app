import {useContext} from "react";
import {v4 as uuid} from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import ErrorContext from "../../store/error-context";
import ToastContext, {Toast, ToastType} from "../../store/toast-context";
import {CategoryMap} from "../../types/transaction";

const storeCategoryMap =
  (addToast: (toast: Toast) => void) =>
  async (categoriesToAdd: CategoryMap) => {
    const prevCategoryMapString = await AsyncStorage.getItem("category-map");
    const prevCategoryMap: CategoryMap = prevCategoryMapString
      ? JSON.parse(prevCategoryMapString)
      : {};

    const prevCategoryNames = Object.keys(prevCategoryMap).map(category =>
      category.trim().toLowerCase()
    );

    const newCategoryNames = Object.keys(categoriesToAdd);

    const {commonCategoryNames, newCategoryMap} = newCategoryNames.reduce<{
      commonCategoryNames: string[];
      newCategoryMap: CategoryMap;
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
              newCategoryMap: {
                ...prevCategoryObject.newCategoryMap,
                [trimmedCategoryName]: categoriesToAdd[newCategory]
              }
            };
      },
      {commonCategoryNames: [], newCategoryMap: {}}
    );

    if (commonCategoryNames.length)
      addToast({
        id: uuid(),
        message: `${commonCategoryNames.join(
          " and "
        )} already exist(s). Please choose unique category names.`,
        type: ToastType.WARNING
      });

    if (Object.keys(newCategoryMap).length)
      await AsyncStorage.setItem(
        "category-map",
        JSON.stringify({...prevCategoryMap, ...newCategoryMap})
      );

    return newCategoryMap;
  };

const useStoreCategoryMap = () => {
  const queryClient = useQueryClient();
  const {addError, removeError} = useContext(ErrorContext);
  const {addToast} = useContext(ToastContext);

  return useMutation({
    mutationFn: storeCategoryMap(addToast),
    // Always refetch the category map after success or error
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["categoryMap"]
      });
    },
    onError: error =>
      addError({
        id: "useStoreCategoryMap",
        error: "AsyncStorage - Store category map",
        errorMessage: `There was a problem storing the category map in AsyncStorage: ${JSON.stringify(
          error
        )}`
      }),
    onSuccess: () => removeError("useStoreCategoryMap")
  });
};

export default useStoreCategoryMap;
