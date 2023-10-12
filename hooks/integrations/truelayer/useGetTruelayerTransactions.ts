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

const getTransactions = async (
  cardId: string,
  dateRange?: TransactionDateRangeQuery
) => {
  // the Truelayer API does not accept timestamps in the future
  // so if any query date range timestamps are provided, they need to be
  // before the current time
  const today = new Date();
  const queryParams = dateRange
    ? `?from=${
        dateRange.from < today
          ? dateRange.from.toISOString()
          : today.toISOString()
      }&to=${
        dateRange.to < today ? dateRange.to.toISOString() : today.toISOString()
      }`
    : "";

  return await trueLayerDataApi.get<CardTransaction[]>(
    `v1/cards/${cardId}/transactions${queryParams}`
  );
};

type UseGetTruelayerTransactionsProps = {
  cardIds: string[];
  dateRange?: TransactionDateRangeQuery;
  enabled?: boolean;
};

const useGetTruelayerTransactions = ({
  cardIds,
  dateRange,
  enabled = true
}: UseGetTruelayerTransactionsProps) => {
  const {addError, removeError} = useContext(ErrorContext);

  // TODO: use combine option when upgrading to Tanstack Query v5

  const combinedQueries = useQueries({
    queries: cardIds.map<
      UseQueryOptions<CardTransaction[], IntegrationErrorResponse>
    >(cardId => ({
      queryKey: ["truelayerTransactions", cardId, dateRange],
      queryFn: () => getTransactions(cardId, dateRange),
      onError: error =>
        addError({...error, id: `useGetTruelayerTransactions-${cardId}`}),
      onSuccess: () => removeError(`useGetTruelayerTransactions-${cardId}`),
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

export default useGetTruelayerTransactions;
