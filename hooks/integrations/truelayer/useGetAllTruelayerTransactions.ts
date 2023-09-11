import {useCallback, useMemo} from "react";

import useGetTruelayerPendingTransactions from "./useGetTruelayerPendingTransactions";
import useGetTruelayerTransactions from "./useGetTruelayerTransactions";

type TransactionDateRangeQuery = {
  from: Date;
  to: Date;
};

const useGetAllTruelayerTransactions = (
  cardId: string,
  dateRange?: TransactionDateRangeQuery
) => {
  const {
    isLoading: isTransactionsLoading,
    isSuccess: isTransactionsSuccess,
    data: transactions,
    refetch: refetchTransactions
  } = useGetTruelayerTransactions(cardId, dateRange);

  const {
    isLoading: isPendingTransactionsLoading,
    isSuccess: isPendingTransactionsSuccess,
    data: pendingTransactions,
    refetch: refetchPendingTransactions
  } = useGetTruelayerPendingTransactions(cardId, dateRange);

  const isSuccess = isTransactionsSuccess && isPendingTransactionsSuccess;

  const refetch = useCallback(() => {
    refetchTransactions();
    refetchPendingTransactions();
  }, [refetchTransactions, refetchPendingTransactions]);

  const data = useMemo(
    () => [...(transactions ?? []), ...(pendingTransactions ?? [])],
    [transactions, pendingTransactions]
  );

  return {
    isLoading: isTransactionsLoading || isPendingTransactionsLoading,
    isSuccess,
    data: isSuccess ? data : [],
    refetch
  };
};

export default useGetAllTruelayerTransactions;
