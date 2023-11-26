import {useContext} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useQuery} from "@tanstack/react-query";

import ErrorContext from "../../store/error-context";
import {Source, TransactionIDToCategoryMapping} from "../../types/transaction";

const getTransactionCategoryMapFromStorage = async (
  transactionIds: string[],
  source: Source
) =>
  (
    await AsyncStorage.multiGet(
      transactionIds.map(transactionId => `${source}-${transactionId}`)
    )
  ).reduce<TransactionIDToCategoryMapping>(
    (mapping, currentTransactionToCategoryKeyValuePair) => ({
      ...mapping,
      [currentTransactionToCategoryKeyValuePair[0].replace(`${source}-`, "")]:
        currentTransactionToCategoryKeyValuePair[1]
    }),
    {}
  );

type UseGetTransactionCategoryMappingProps = {
  transactionIds: string[];
  source: Source;
  enabled?: boolean;
};

const useGetTransactionCategoryMap = ({
  transactionIds,
  source,
  enabled = true
}: UseGetTransactionCategoryMappingProps) => {
  const {addError, removeError} = useContext(ErrorContext);

  return useQuery({
    queryKey: ["transactionCategoryMapping", ...transactionIds, source],
    queryFn: () => getTransactionCategoryMapFromStorage(transactionIds, source),
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
