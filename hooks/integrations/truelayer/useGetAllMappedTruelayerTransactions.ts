import {mapTrueLayerTransactionToInternalTransaction} from "./trueLayerMappings";
import useGetAllTruelayerCards from "./useGetAllTruelayerCards";
import useGetAllTruelayerTransactions from "./useGetAllTruelayerTransactions";

import {DateRange} from "../../../types/transaction";
import useMapTransactionsToInternalTransactions from "../../transactions/useMapTransactionsToInternalTransactions";

type UseGetAllMappedTruelayerTransactionsProps = {
  dateRange?: DateRange;
  enabled?: boolean;
};

const useGetAllMappedTruelayerTransactions = ({
  dateRange,
  enabled = true
}: UseGetAllMappedTruelayerTransactionsProps = {}) => {
  const {
    isLoading: isTruelayerCardsLoading,
    isRefetching: isTruelayerCardsRefetching,
    data: truelayerCardData,
    refetch: refetchCardData
  } = useGetAllTruelayerCards({enabled});

  const cardIds = truelayerCardData?.map(card => card.account_id) ?? [];

  const {
    isLoading: isTruelayerTransactionsLoading,
    data: truelayerTransactions
  } = useGetAllTruelayerTransactions({
    cardIds,
    dateRange,
    enabled: !isTruelayerCardsLoading && !isTruelayerCardsRefetching
  });

  const isMapEnabled = Boolean(truelayerTransactions.length);

  const {transactions, isLoading: isMapLoading} =
    useMapTransactionsToInternalTransactions({
      transactions: truelayerTransactions,
      mapTransactionToInternalTransaction:
        mapTrueLayerTransactionToInternalTransaction,
      enabled: isMapEnabled
    });

  return {
    isLoading:
      isTruelayerCardsLoading ||
      isTruelayerTransactionsLoading ||
      (isMapLoading && isMapEnabled),
    transactions,
    // only refetchCardData is called here because, as soon as the card data is refetched,
    // the transaction queries are disabled. After the card query is finished, the transaction
    // query is enabled again, which triggers an automatic refetch of the transaction data
    refetch: refetchCardData
  };
};

export default useGetAllMappedTruelayerTransactions;
