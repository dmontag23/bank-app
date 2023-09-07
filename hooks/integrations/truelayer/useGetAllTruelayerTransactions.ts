import {useCallback, useMemo} from "react";

import useGetTruelayerPendingTransactions from "./useGetTruelayerPendingTransactions";
import useGetTruelayerTransactions from "./useGetTruelayerTransactions";

type TransactionDateRangeQuery = {
  from: Date;
  to: Date;
};

const useGetAllTruelayerTransactions = (
  acctId: string,
  dateRange?: TransactionDateRangeQuery
) => {
  const {
    isLoading: isTransactionsLoading,
    isSuccess: isTransactionsSuccess,
    data: transactions,
    refetch: refetchTransactions
  } = useGetTruelayerTransactions(acctId, dateRange);

  const {
    isLoading: isPendingTransactionsLoading,
    isSuccess: isPendingTransactionsSuccess,
    data: pendingTransactions,
    refetch: refetchPendingTransactions
  } = useGetTruelayerPendingTransactions(acctId, dateRange);

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
