import {useContext} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import ErrorContext from "../../store/error-context";
import {Source, TransactionIDToCategoryMapping} from "../../types/transaction";

type StoreTransactionCategoryMappingArgs = {
  transactionIdToCategoryMapping: TransactionIDToCategoryMapping;
  source: Source;
};

const storeTransactionCategoryMapping = async ({
  transactionIdToCategoryMapping,
  source
}: StoreTransactionCategoryMappingArgs) => {
  const mappingArray = Object.keys(transactionIdToCategoryMapping).map(
    id =>
      [`${source}-${id}`, transactionIdToCategoryMapping[id]] as [
        string,
        string
      ]
  );
  if (mappingArray.length) await AsyncStorage.multiSet(mappingArray);
  return transactionIdToCategoryMapping;
};

const useStoreTransactionCategoryMap = () => {
  const queryClient = useQueryClient();
  const {addError, removeError} = useContext(ErrorContext);

  return useMutation({
    mutationFn: storeTransactionCategoryMapping,
    // Always refetch all transaction category mappings after success or error
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactionCategoryMapping"]
      });
    },
    onError: error =>
      addError({
        id: "useStoreTransactionCategoryMap",
        error: "AsyncStorage - Store transaction category map",
        errorMessage: `There was a problem storing the transaction category map in AsyncStorage: ${JSON.stringify(
          error
        )}`
      }),
    onSuccess: () => removeError("useStoreTransactionCategoryMap")
  });
};

export default useStoreTransactionCategoryMap;
