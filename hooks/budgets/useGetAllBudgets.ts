import {useContext} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useQuery} from "@tanstack/react-query";

import ErrorContext from "../../store/error-context";
import {Budget} from "../../types/budget";

const getAllBudgets = async () => {
  const budgetKeys = (await AsyncStorage.getAllKeys()).filter(key =>
    key.startsWith("budget")
  );
  return (await AsyncStorage.multiGet(budgetKeys)).map<Budget>(
    budgetKeyValuePair => {
      const parsedBudget = JSON.parse(budgetKeyValuePair[1] as string);
      return {
        ...parsedBudget,
        window: {
          start: new Date(parsedBudget.window.start),
          end: new Date(parsedBudget.window.end)
        }
      };
    }
  );
};

const useGetAllBudgets = () => {
  const {addError, removeError} = useContext(ErrorContext);

  return useQuery({
    queryKey: ["budgets"],
    queryFn: getAllBudgets,
    onError: error =>
      addError({
        id: "useGetAllBudgets",
        error: "AsyncStorage - Get All Budgets",
        errorMessage: `There was a problem getting all budgets from AsyncStorage: ${JSON.stringify(
          error
        )}`
      }),
    onSuccess: () => removeError("useGetAllBudgets")
  });
};

export default useGetAllBudgets;
