import {useContext} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useQuery} from "@tanstack/react-query";

import ErrorContext from "../../store/error-context";
import {TransactionIDToCategoryMapping} from "../../types/transaction";

const getTransactionCategoryMapFromStorage = async (
  transactionIds: string[],
  prefix: string
) =>
  (
    await AsyncStorage.multiGet(
      transactionIds.map(transactionId => `${prefix}-${transactionId}`)
    )
  ).reduce<TransactionIDToCategoryMapping>(
    (mapping, currentTransactionToCategoryKeyValuePair) => ({
      ...mapping,
      [currentTransactionToCategoryKeyValuePair[0].replace(`${prefix}-`, "")]:
        currentTransactionToCategoryKeyValuePair[1]
    }),
    {}
  );

type UseGetTransactionCategoryMappingProps = {
  transactionIds: string[];
  prefix: string;
  enabled?: boolean;
};

const useGetTransactionCategoryMap = ({
  transactionIds,
  prefix,
  enabled = true
}: UseGetTransactionCategoryMappingProps) => {
  const {addError, removeError} = useContext(ErrorContext);

  return useQuery({
    queryKey: ["transactionCategoryMapping", ...transactionIds, prefix],
    queryFn: () => getTransactionCategoryMapFromStorage(transactionIds, prefix),
    enabled,
    onError: error =>
      addError({
        id: "useGetTransactionCategoryMap",
        error: "AsyncStorage - Get transaction category map",
        errorMessage: `There was a problem getting the transaction category map from AsyncStorage: ${JSON.stringify(
          error
        )}`
      }),
    onSuccess: () => removeError("useGetTransactionCategoryMap")
  });
};

export default useGetTransactionCategoryMap;
