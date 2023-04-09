import AsyncStorage from "@react-native-async-storage/async-storage";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import {TransactionIDToCategoryMapping} from "../types/transaction";

const storeTransactionCategoryMapping = async (
  transactionIdToCategoryMapping: TransactionIDToCategoryMapping
) => {
  const mappingArray = Object.keys(transactionIdToCategoryMapping).map(
    id => [id, transactionIdToCategoryMapping[id]] as [string, string]
  );
  if (mappingArray.length) await AsyncStorage.multiSet(mappingArray);
  return transactionIdToCategoryMapping;
};

const useStoreTransactionCategoryMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storeTransactionCategoryMapping,
    onMutate: async newMapping => {
      if (!Object.keys(newMapping).length) return;
      const queryKey = [
        "transactionCategoryMapping",
        ...Object.keys(newMapping)
      ];
      // Cancel any outgoing re-fetches for any transaction category mappings
      // so they don't overwrite the optimistic update
      await queryClient.cancelQueries({
        queryKey: ["transactionCategoryMapping"]
      });

      // Snapshot the previous value
      const previousMapping =
        queryClient.getQueryData<TransactionIDToCategoryMapping>(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData<TransactionIDToCategoryMapping>(
        queryKey,
        () => newMapping
      );

      // Return a context object with the snapshotted value
      return {previousMapping};
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_, variables, context) => {
      const previousCacheValue = context?.previousMapping;
      previousCacheValue
        ? queryClient.setQueryData<TransactionIDToCategoryMapping>(
            ["transactionCategoryMapping", ...Object.keys(variables)],
            previousCacheValue
          )
        : queryClient.removeQueries([
            "transactionCategoryMapping",
            ...Object.keys(variables)
          ]);
    },
    // Always refetch all transaction category mappings after success or error
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactionCategoryMapping"]
      });
    }
  });
};

export default useStoreTransactionCategoryMapping;
