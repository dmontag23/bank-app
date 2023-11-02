import {useContext} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useQuery} from "@tanstack/react-query";

import ErrorContext from "../../store/error-context";
import {CategoryMap} from "../../types/transaction";

const getCategories = async (): Promise<CategoryMap> => {
  const categoryArrayString = await AsyncStorage.getItem("categories");
  return categoryArrayString ? JSON.parse(categoryArrayString) : [];
};

const useGetCategories = () => {
  const {addError, removeError} = useContext(ErrorContext);

  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    onError: error =>
      addError({
        id: "useGetCategories",
        error: "AsyncStorage - Get categories",
        errorMessage: `There was a problem getting the categories from AsyncStorage: ${JSON.stringify(
          error
        )}`
      }),
    onSuccess: () => removeError("useGetCategories")
  });
};

export default useGetCategories;
