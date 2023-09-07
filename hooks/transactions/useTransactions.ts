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
import useGetAllTruelayerTransactions from "../integrations/truelayer/useGetAllTruelayerTransactions";

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
    isLoading: isTruelayerTransactionsLoading,
    isSuccess: isTruelayerTransactionsSuccess,
    data: truelayerTransactions,
    refetch
  } = useGetAllTruelayerTransactions(acctId, dateRange);

  const trueLayerTransactionIds = truelayerTransactions.map(
    transaction => transaction.transaction_id
  );

  const {
    isLoading: isTransactionToCategoryMapLoading,
    isSuccess: isTransactionToCategoryMapSuccess,
    data: trueLayerTransactionToCategoryMap
  } = useGetTransactionCategoryMap({
    transactionIds: trueLayerTransactionIds,
    enabled: !isTruelayerTransactionsLoading
  });

  const {mutate: storeTransactionCategoryMap} =
    useStoreTransactionCategoryMap();

  const {unsavedTransactionsToCategoryMap, transactions} = useMemo(
    () =>
      !isTruelayerTransactionsSuccess || !isTransactionToCategoryMapSuccess
        ? {unsavedTransactionsToCategoryMap: {}, transactions: []}
        : assignCategoriesToTransactions(
            truelayerTransactions,
            trueLayerTransactionToCategoryMap
          ),
    [
      truelayerTransactions,
      trueLayerTransactionToCategoryMap,
      isTruelayerTransactionsSuccess,
      isTransactionToCategoryMapSuccess
    ]
  );

  useEffect(() => {
    if (Object.keys(unsavedTransactionsToCategoryMap).length)
      storeTransactionCategoryMap(unsavedTransactionsToCategoryMap);
  }, [storeTransactionCategoryMap, unsavedTransactionsToCategoryMap]);

  return {
    isLoading:
      isTruelayerTransactionsLoading || isTransactionToCategoryMapLoading,
    transactions,
    refetch
  };
};

export default useTransactions;
