import {useMemo} from "react";

import useGetTruelayerPendingTransactions from "./useGetTruelayerPendingTransactions";
import useGetTruelayerSettledTransactions from "./useGetTruelayerSettledTransactions";

import {DateRange} from "../../../types/transaction";

type UseGetAllTruelayerTransactionsProps = {
  cardIds: string[];
  dateRange?: DateRange;
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
