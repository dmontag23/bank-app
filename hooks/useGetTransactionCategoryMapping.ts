import AsyncStorage from "@react-native-async-storage/async-storage";
import {useQuery} from "@tanstack/react-query";

import {
  TransactionCategory,
  TransactionIDToCategoryMapping
} from "../types/transaction";

const getTransactionCategoryMappingFromStorage = async (
  transactionIds: string[]
) =>
  (
    await AsyncStorage.multiGet(transactionIds)
  ).reduce<TransactionIDToCategoryMapping>(
    (mapping, currentTransactionToCategoryKeyValuePair) => ({
      ...mapping,
      [currentTransactionToCategoryKeyValuePair[0]]:
        currentTransactionToCategoryKeyValuePair[1] as TransactionCategory
    }),
    {}
  );

interface UseGetTransactionCategoryMappingProps {
  transactionIds: string[];
  enabled?: boolean;
}
const useGetTransactionCategoryMapping = ({
  transactionIds,
  enabled = true
}: UseGetTransactionCategoryMappingProps) =>
  useQuery<TransactionIDToCategoryMapping>({
    queryKey: ["transactionCategoryMapping", ...transactionIds],
    queryFn: () => getTransactionCategoryMappingFromStorage(transactionIds),
    enabled
  });

export default useGetTransactionCategoryMapping;
