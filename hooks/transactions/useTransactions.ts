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
import useGetAllTruelayerCards from "../integrations/truelayer/useGetAllTruelayerCards";
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

type UseTransactionsProps = {
  dateRange?: UseTransactionsDateRangeProp;
  enabled?: boolean;
};

const useTransactions = ({
  dateRange,
  enabled = true
}: UseTransactionsProps = {}) => {
  const {
    isLoading: isTruelayerCardsLoading,
    isRefetching: isTruelayerCardsRefetching,
    data: truelayerCardData,
    refetch: refetchCardData
  } = useGetAllTruelayerCards({enabled});

  const cardIds = truelayerCardData?.map(card => card.account_id) ?? [];

  const {
    isLoading: isTruelayerTransactionsLoading,
    isSuccess: isTruelayerTransactionsSuccess,
    data: truelayerTransactions
  } = useGetAllTruelayerTransactions({
    cardIds,
    dateRange,
    enabled: !isTruelayerCardsLoading && !isTruelayerCardsRefetching
  });

  const trueLayerTransactionIds = truelayerTransactions.map(
    transaction => transaction.transaction_id
  );

  const {
    isLoading: isTransactionToCategoryMapLoading,
    isSuccess: isTransactionToCategoryMapSuccess,
    data: trueLayerTransactionToCategoryMap
  } = useGetTransactionCategoryMap({
    transactionIds: trueLayerTransactionIds,
    enabled: isTruelayerTransactionsSuccess
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
      isTruelayerCardsLoading ||
      isTruelayerTransactionsLoading ||
      isTransactionToCategoryMapLoading,
    transactions,
    // only refetchCardData is called here because, as soon as the card data is refetched,
    // the transaction queries are disabled. After the card query is finished, the transaction
    // query is enabled again, which triggers an automatic refetch of the transaction data
    refetch: refetchCardData
  };
};

export default useTransactions;
