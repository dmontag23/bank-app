import AsyncStorage from "@react-native-async-storage/async-storage";
import {useMutation, useQueryClient} from "@tanstack/react-query";

const deleteBudget = async (budgetId: string) =>
  await AsyncStorage.removeItem(`budget-${budgetId}`);

const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBudget,
    // Always refetch all budgets after success or error
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["budgets"]
      });
    }
  });
};

export default useDeleteBudget;
