import {useContext} from "react";
import {useQueries, UseQueryOptions} from "@tanstack/react-query";

import {trueLayerDataApi} from "../../../api/axiosConfig";
import ErrorContext from "../../../store/error-context";
import {IntegrationErrorResponse} from "../../../types/errors";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";

type TransactionDateRangeQuery = {
  from: Date;
  to: Date;
};

// Note that the pending transactions endpoint cannot filter
// pending transactions by a date range, so we have to do that
// manually here
const getPendingTransactions = async (
  cardId: string,
  dateRange?: TransactionDateRangeQuery
) =>
  (
    await trueLayerDataApi.get<CardTransaction[]>(
      `v1/cards/${cardId}/transactions/pending`
    )
  ).filter(transaction => {
    if (!dateRange) return true;
    const transactionTimestamp = new Date(transaction.timestamp);
    return (
      dateRange.from <= transactionTimestamp &&
      transactionTimestamp <= dateRange.to
    );
  });

type UseGetTruelayerPendingTransactionsProps = {
  cardIds: string[];
  dateRange?: TransactionDateRangeQuery;
  enabled?: boolean;
};

const useGetTruelayerPendingTransactions = ({
  cardIds,
  dateRange,
  enabled = true
}: UseGetTruelayerPendingTransactionsProps) => {
  const {addError, removeError} = useContext(ErrorContext);

  // TODO: use combine option when upgrading to Tanstack Query v5

  const combinedQueries = useQueries({
    queries: cardIds.map<
      UseQueryOptions<CardTransaction[], IntegrationErrorResponse>
    >(cardId => ({
      queryKey: ["truelayerPendingTransactions", cardId, dateRange],
      queryFn: () => getPendingTransactions(cardId, dateRange),
      onError: error =>
        addError({
          ...error,
          id: `useGetTruelayerPendingTransactions-${cardId}`
        }),
      onSuccess: () =>
        removeError(`useGetTruelayerPendingTransactions-${cardId}`),
      enabled
    }))
  });

  return {
    // note that this implies partial data can be returned
    // from this hook even if 1 of the calls fails
    data: combinedQueries.reduce<CardTransaction[]>(
      (acc, cur) => [...(cur.data ?? []), ...acc],
      []
    ),
    isLoading: combinedQueries.some(query => query.isLoading),
    isSuccess: combinedQueries.every(query => query.isSuccess)
  };
};

export default useGetTruelayerPendingTransactions;
