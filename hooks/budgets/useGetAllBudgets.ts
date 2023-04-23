import AsyncStorage from "@react-native-async-storage/async-storage";
import {useQuery} from "@tanstack/react-query";

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

const useGetAllBudgets = () =>
  useQuery({
    queryKey: ["budgets"],
    queryFn: getAllBudgets
  });

export default useGetAllBudgets;
