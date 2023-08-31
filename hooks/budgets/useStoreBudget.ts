import {useContext} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import ErrorContext from "../../store/error-context";
import {Budget} from "../../types/budget";

const storeBudget = async (budget: Budget) => {
  await AsyncStorage.setItem(`budget-${budget.id}`, JSON.stringify(budget));
  return budget;
};

const useStoreBudget = () => {
  const queryClient = useQueryClient();
  const {addError, removeError} = useContext(ErrorContext);

  return useMutation({
    mutationFn: storeBudget,
    // Always refetch all budgets after success or error
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["budgets"]
      });
    },
    onError: error =>
      addError({
        id: "useStoreBudget",
        error: "AsyncStorage - Store Budget",
        errorMessage: `There was a problem storing the budget in AsyncStorage: ${JSON.stringify(
          error
        )}`
      }),
    onSuccess: () => removeError("useStoreBudget")
  });
};

export default useStoreBudget;
