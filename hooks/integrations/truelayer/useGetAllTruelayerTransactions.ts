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
    isLoading: isSettledTransactionsLoading,
    isSuccess: isSettledTransactionsSuccess,
    data: settledTransactions
  } = useGetTruelayerSettledTransactions(props);

  const {
    isLoading: isPendingTransactionsLoading,
    isSuccess: isPendingTransactionsSuccess,
    data: pendingTransactions
  } = useGetTruelayerPendingTransactions(props);

  const data = useMemo(
    () => [...(settledTransactions ?? []), ...(pendingTransactions ?? [])],
    [settledTransactions, pendingTransactions]
  );

  const isSuccess =
    isSettledTransactionsSuccess && isPendingTransactionsSuccess;

  return {
    isLoading: isSettledTransactionsLoading || isPendingTransactionsLoading,
    isSuccess,
    data: isSuccess ? data : []
  };
};

export default useGetAllTruelayerTransactions;
