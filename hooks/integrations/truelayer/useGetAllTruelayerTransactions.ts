import {useMemo} from "react";

import useGetTruelayerPendingTransactions from "./useGetTruelayerPendingTransactions";
import useGetTruelayerSettledTransactions from "./useGetTruelayerSettledTransactions";

type TransactionDateRangeQuery = {
  from: Date;
  to: Date;
};

type UseGetAllTruelayerTransactionsProps = {
  cardIds: string[];
  dateRange?: TransactionDateRangeQuery;
  enabled?: boolean;
};

const useGetAllTruelayerTransactions = (
  props: UseGetAllTruelayerTransactionsProps
) => {
  const {
    isLoading: isTransactionsLoading,
    isSuccess: isTransactionsSuccess,
    data: transactions
  } = useGetTruelayerSettledTransactions(props);

  const {
    isLoading: isPendingTransactionsLoading,
    isSuccess: isPendingTransactionsSuccess,
    data: pendingTransactions
  } = useGetTruelayerPendingTransactions(props);

  const data = useMemo(
    () => [...(transactions ?? []), ...(pendingTransactions ?? [])],
    [transactions, pendingTransactions]
  );

  const isSuccess = isTransactionsSuccess && isPendingTransactionsSuccess;

  return {
    isLoading: isTransactionsLoading || isPendingTransactionsLoading,
    isSuccess,
    data: isSuccess ? data : []
  };
};

export default useGetAllTruelayerTransactions;
