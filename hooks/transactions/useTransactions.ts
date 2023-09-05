import {useEffect, useMemo} from "react";

import useGetTransactionCategoryMap from "./useGetTransactionCategoryMap";
import useStoreTransactionCategoryMap from "./useStoreTransactionCategoryMap";

import {
  Transaction,
  TransactionIDToCategoryMapping
} from "../../types/transaction";
import {CardTransaction} from "../../types/trueLayer/dataAPI/cards";
import {
  mapTrueLayerCategoryToInternalCategory,
  mapTrueLayerTransactionToInternalTransaction
} from "../integrations/truelayer/trueLayerMappings";
import useGetTruelayerTransactions from "../integrations/truelayer/useGetTruelayerTransactions";

// TODO: Consider moving this to trueLayerMappings? Maybe when adding Starling data
const assignCategoriesToTransactions = (
  trueLayerCardTransactions: CardTransaction[],
  trueLayerTransactionIdToCategoryMap: TransactionIDToCategoryMapping
) =>
  trueLayerCardTransactions.reduce<{
    unsavedTransactionsToCategoryMap: TransactionIDToCategoryMapping;
    transactions: Transaction[];
  }>(
    ({unsavedTransactionsToCategoryMap, transactions}, currentTransaction) => {
      const transactionId = currentTransaction.transaction_id;

      const savedCategory =
        trueLayerTransactionIdToCategoryMap?.[transactionId];
      const category =
        savedCategory ??
        mapTrueLayerCategoryToInternalCategory(
          currentTransaction.transaction_classification
        );

      return {
        unsavedTransactionsToCategoryMap: savedCategory
          ? unsavedTransactionsToCategoryMap
          : {
              ...unsavedTransactionsToCategoryMap,
              [transactionId]: category
            },
        transactions: [
          ...transactions,
          mapTrueLayerTransactionToInternalTransaction(
            currentTransaction,
            category
          )
        ]
      };
    },
    {
      unsavedTransactionsToCategoryMap: {},
      transactions: []
    }
  );

type UseTransactionsDateRangeProp = {
  from: Date;
  to: Date;
};

const useTransactions = (
  acctId: string,
  dateRange?: UseTransactionsDateRangeProp
) => {
  const {
    isLoading: isTrueLayerTransactionsLoading,
    isSuccess: isTrueLayerTransactionsSuccess,
    data: trueLayerTransactions,
    refetch
  } = useGetTruelayerTransactions(acctId, dateRange);

  const trueLayerTransactionIds = (trueLayerTransactions ?? []).map(
    transaction => transaction.transaction_id
  );

  const {
    isLoading: isTransactionToCategoryMapLoading,
    isSuccess: isTransactionToCategoryMapSuccess,
    data: trueLayerTransactionToCategoryMap
  } = useGetTransactionCategoryMap({
    transactionIds: trueLayerTransactionIds,
    enabled: !isTrueLayerTransactionsLoading
  });

  const {mutate: storeTransactionCategoryMap} =
    useStoreTransactionCategoryMap();

  const {unsavedTransactionsToCategoryMap, transactions} = useMemo(
    () =>
      !isTrueLayerTransactionsSuccess || !isTransactionToCategoryMapSuccess
        ? {unsavedTransactionsToCategoryMap: {}, transactions: []}
        : assignCategoriesToTransactions(
            trueLayerTransactions,
            trueLayerTransactionToCategoryMap
          ),
    [
      trueLayerTransactions,
      trueLayerTransactionToCategoryMap,
      isTrueLayerTransactionsSuccess,
      isTransactionToCategoryMapSuccess
    ]
  );

  useEffect(() => {
    if (Object.keys(unsavedTransactionsToCategoryMap).length)
      storeTransactionCategoryMap(unsavedTransactionsToCategoryMap);
  }, [storeTransactionCategoryMap, unsavedTransactionsToCategoryMap]);

  return {
    isLoading:
      isTrueLayerTransactionsLoading || isTransactionToCategoryMapLoading,
    transactions,
    refetch
  };
};

export default useTransactions;
