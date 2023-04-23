import AsyncStorage from "@react-native-async-storage/async-storage";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import {TransactionIDToCategoryMapping} from "../../types/transaction";

const storeTransactionCategoryMapping = async (
  transactionIdToCategoryMapping: TransactionIDToCategoryMapping
) => {
  const mappingArray = Object.keys(transactionIdToCategoryMapping).map(
    id => [id, transactionIdToCategoryMapping[id]] as [string, string]
  );
  if (mappingArray.length) await AsyncStorage.multiSet(mappingArray);
  return transactionIdToCategoryMapping;
};

const useStoreTransactionCategoryMap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storeTransactionCategoryMapping,
    // Always refetch all transaction category mappings after success or error
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactionCategoryMapping"]
      });
    }
  });
};

export default useStoreTransactionCategoryMap;
