import {useCallback} from "react";

import {DateRange} from "../../types/transaction";
import useGetAllMappedStarlingTransactions from "../integrations/starling/useGetAllMappedStarlingTransactions";
import useGetAllMappedTruelayerTransactions from "../integrations/truelayer/useGetAllMappedTruelayerTransactions";

type UseGetTransactions = {
  enabled?: boolean;
  dateRange?: DateRange;
};

const useGetTransactions = ({
  enabled = true,
  dateRange
}: UseGetTransactions = {}) => {
  const {
    isLoading: isStarlingTransactionsLoading,
    transactions: starlingTransactions,
    refetch: refetchStarlingTransactions
  } = useGetAllMappedStarlingTransactions({enabled, dateRange});

  const {
    isLoading: isTruelayerTransactionsLoading,
    transactions: truelayerTransactions,
    refetch: refetchTruelayerTransactions
  } = useGetAllMappedTruelayerTransactions({enabled, dateRange});

  const combinedTransactions = starlingTransactions
    .concat(truelayerTransactions)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const refetch = useCallback(() => {
    refetchStarlingTransactions();
    refetchTruelayerTransactions();
  }, [refetchStarlingTransactions, refetchTruelayerTransactions]);

  return {
    isLoading: isStarlingTransactionsLoading || isTruelayerTransactionsLoading,
    transactions: combinedTransactions,
    refetch
  };
};

export default useGetTransactions;
