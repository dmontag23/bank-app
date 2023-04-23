import AsyncStorage from "@react-native-async-storage/async-storage";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import {Budget} from "../../types/budget";

const storeBudget = async (budget: Budget) => {
  await AsyncStorage.setItem(`budget-${budget.id}`, JSON.stringify(budget));
  return budget;
};

const useStoreBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storeBudget,
    // Always refetch all budgets after success or error
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["budgets"]
      });
    }
  });
};

export default useStoreBudget;
