import {useContext} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useQuery} from "@tanstack/react-query";

import ErrorContext from "../../store/error-context";
import {CategoryMap} from "../../types/transaction";

const getCategoryMap = async (): Promise<CategoryMap> => {
  const categoryMapString = await AsyncStorage.getItem("category-map");
  return categoryMapString ? JSON.parse(categoryMapString) : [];
};

const useGetCategoryMap = () => {
  const {addError, removeError} = useContext(ErrorContext);

  return useQuery({
    queryKey: ["categoryMap"],
    queryFn: getCategoryMap,
    onError: error =>
      addError({
        id: "useGetCategoryMap",
        error: "AsyncStorage - Get category map",
        errorMessage: `There was a problem getting the category map from AsyncStorage: ${JSON.stringify(
          error
        )}`
      }),
    onSuccess: () => removeError("useGetCategoryMap")
  });
};

export default useGetCategoryMap;
