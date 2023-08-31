import {useContext} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import ErrorContext from "../../store/error-context";

const deleteBudget = async (budgetId: string) =>
  await AsyncStorage.removeItem(`budget-${budgetId}`);

const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  const {addError, removeError} = useContext(ErrorContext);
  return useMutation({
    mutationFn: deleteBudget,
    // Always refetch all budgets after success or error
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["budgets"]
      });
    },
    onError: error =>
      addError({
        id: "useDeleteBudget",
        error: "AsyncStorage - Delete Budget",
        errorMessage: `There was a problem deleting the budget in AsyncStorage ${JSON.stringify(
          error
        )}`
      }),
    onSuccess: () => removeError("useDeleteBudget")
  });
};

export default useDeleteBudget;
