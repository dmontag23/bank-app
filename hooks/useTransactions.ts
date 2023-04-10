import {useEffect, useMemo} from "react";

import {
  mapTrueLayerCategoryToInternalCategory,
  mapTrueLayerTransactionToInternalTransaction
} from "./integrations/truelayer/trueLayerMappings";
import useTrueLayerTransactionsFromAcct from "./integrations/truelayer/useTrueLayerTransactionsFromAcct";
import useGetTransactionToCategoryMap from "./useGetTransactionCategoryMap";
import useStoreTransactionCategoryMap from "./useStoreTransactionCategoryMap";

import {
  Transaction,
  TransactionIDToCategoryMapping
} from "../types/transaction";
import {CardTransaction} from "../types/trueLayer/dataAPI/cards";

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
      const transactionId = `truelayer-${currentTransaction.transaction_id}`;

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

const useTransactions = (acctId: string) => {
  const {
    isLoading: isTrueLayerTransactionsLoading,
    isSuccess: isTrueLayerTransactionsSuccess,
    data: trueLayerTransactions
  } = useTrueLayerTransactionsFromAcct(acctId);

  // TODO: This id is being generated in multiple places (3).
  // It would be good if it was centralized in a single place.
  const trueLayerTransactionIds = (trueLayerTransactions ?? []).map(
    transaction => `truelayer-${transaction.transaction_id}`
  );

  const {
    isLoading: isTransactionToCategoryMapLoading,
    isSuccess: isTransactionToCategoryMapSuccess,
    data: trueLayerTransactionToCategoryMap
  } = useGetTransactionToCategoryMap({
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
    transactions
  };
};

export default useTransactions;
