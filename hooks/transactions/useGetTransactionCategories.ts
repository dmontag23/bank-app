import {useContext} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useQuery} from "@tanstack/react-query";

import ErrorContext from "../../store/error-context";

const getTransactionCategories = async (): Promise<string[]> => {
  const categoryArrayString = await AsyncStorage.getItem("categories");
  return categoryArrayString ? JSON.parse(categoryArrayString) : [];
};

const useGetTransactionCategories = () => {
  const {addError, removeError} = useContext(ErrorContext);

  return useQuery({
    queryKey: ["transactionCategories"],
    queryFn: getTransactionCategories,
    onError: error =>
      addError({
        id: "useGetTransactionCategories",
        error: "AsyncStorage - Get transaction categories",
        errorMessage: `There was a problem getting the transaction categories from AsyncStorage: ${JSON.stringify(
          error
        )}`
      }),
    onSuccess: () => removeError("useGetTransactionCategories")
  });
};

export default useGetTransactionCategories;
