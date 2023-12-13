import {useCallback} from "react";

import {DateRange} from "../../types/transaction";
import useGetAllMappedStarlingTransactions from "../integrations/starling/useGetAllMappedStarlingTransactions";
import useGetAllMappedTruelayerTransactions from "../integrations/truelayer/useGetAllMappedTruelayerTransactions";

type UseGetTransactions = {dateRange?: DateRange};

const useGetTransactions = ({dateRange}: UseGetTransactions = {}) => {
  const {
    isLoading: isStarlingTransactionsLoading,
    transactions: starlingTransactions,
    refetch: refetchStarlingTransactions,
    isRefetching: isStarlingTransactionsRefetching
  } = useGetAllMappedStarlingTransactions({dateRange});

  const {
    isLoading: isTruelayerTransactionsLoading,
    transactions: truelayerTransactions,
    refetch: refetchTruelayerTransactions,
    isRefetching: isTruelayerTransactionsRefetching
  } = useGetAllMappedTruelayerTransactions({dateRange});

  const combinedTransactions = starlingTransactions
    .concat(truelayerTransactions)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const refetch = useCallback(() => {
    refetchStarlingTransactions();
    refetchTruelayerTransactions();
  }, [refetchStarlingTransactions, refetchTruelayerTransactions]);

  return {
    isLoading: isStarlingTransactionsLoading || isTruelayerTransactionsLoading,
    isRefetching:
      isStarlingTransactionsRefetching || isTruelayerTransactionsRefetching,
    transactions: combinedTransactions,
    refetch
  };
};

export default useGetTransactions;
