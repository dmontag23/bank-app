import {useContext, useMemo} from "react";
import {useQueries, UseQueryOptions} from "@tanstack/react-query";

import {trueLayerDataApi} from "../../../api/axiosConfig";
import ErrorContext from "../../../store/error-context";
import {IntegrationErrorResponse} from "../../../types/errors";
import {DateRange} from "../../../types/transaction";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";

const getTransactions = async (cardId: string, dateRange?: DateRange) => {
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

type UseGetTruelayerSettledTransactionsProps = {
  cardIds: string[];
  dateRange?: DateRange;
  enabled?: boolean;
};

const useGetTruelayerSettledTransactions = ({
  cardIds,
  dateRange,
  enabled = true
}: UseGetTruelayerSettledTransactionsProps) => {
  const {addError, removeError} = useContext(ErrorContext);

  // TODO: use combine option when upgrading to Tanstack Query v5

  const combinedQueries = useQueries({
    queries: cardIds.map<
      UseQueryOptions<CardTransaction[], IntegrationErrorResponse>
    >(cardId => ({
      queryKey: ["truelayerSettledTransactions", cardId, dateRange],
      queryFn: () => getTransactions(cardId, dateRange),
      onError: error =>
        addError({
          ...error,
          id: `useGetTruelayerSettledTransactions-${cardId}`
        }),
      onSuccess: () =>
        removeError(`useGetTruelayerSettledTransactions-${cardId}`),
      enabled
    }))
  });

  // TODO: instead of extracting the data here and ensuring that the combined
  // data does not change on re-renders with useMemo, the combine feature of TanStack
  // query should be used when upgrading to TanStack Query v5
  const allData = combinedQueries.map(query => query.data);
  const combinedData = useMemo(
    () =>
      allData.reduce<CardTransaction[]>(
        (acc, cur) => [...(cur ?? []), ...acc],
        []
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(allData)]
  );

  return {
    // note that this implies partial data can be returned
    // from this hook even if 1 of the calls fails
    data: combinedData,
    isLoading: combinedQueries.some(query => query.isLoading),
    isRefetching: combinedQueries.some(query => query.isRefetching),
    isSuccess: combinedQueries.every(query => query.isSuccess)
  };
};

export default useGetTruelayerSettledTransactions;
