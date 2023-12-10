import {useContext, useMemo} from "react";
import {useQueries, UseQueryOptions} from "@tanstack/react-query";

import {starlingApi} from "../../../api/axiosConfig";
import ErrorContext from "../../../store/error-context";
import {IntegrationErrorResponse} from "../../../types/errors";
import {StarlingFeedItem} from "../../../types/starling/feedItems";
import {DateRange} from "../../../types/transaction";

const getTransactions = async (
  accountId: string,
  categoryId: string,
  dateRange?: DateRange
) => {
  // Starling was founded in 2014, so there will not be any transactions before 2014
  const queryParams = `?minTransactionTimestamp=${
    dateRange?.from?.toISOString() ?? new Date("2014-01-01").toISOString()
  }&maxTransactionTimestamp=${
    dateRange?.to?.toISOString() ?? new Date().toISOString()
  }`;

  const items = await starlingApi.get<{feedItems: StarlingFeedItem[]}>(
    `v2/feed/account/${accountId}/category/${categoryId}/transactions-between${queryParams}`
  );
  return items.feedItems;
};

type UseGetStarlingTransactionsProps = {
  ids: {accountId: string; categoryId: string}[];
  dateRange?: DateRange;
  enabled?: boolean;
};

const useGetStarlingTransactions = ({
  ids,
  dateRange,
  enabled = true
}: UseGetStarlingTransactionsProps) => {
  const {addError, removeError} = useContext(ErrorContext);

  // TODO: use combine option when upgrading to Tanstack Query v5

  const combinedQueries = useQueries({
    queries: ids.map<
      UseQueryOptions<StarlingFeedItem[], IntegrationErrorResponse>
    >(({accountId, categoryId}) => ({
      queryKey: ["starlingTransactions", accountId, categoryId, dateRange],
      queryFn: () => getTransactions(accountId, categoryId, dateRange),
      onError: error =>
        addError({
          ...error,
          id: `useGetStarlingTransactions-${accountId}-${categoryId}`
        }),
      onSuccess: () =>
        removeError(`useGetStarlingTransactions-${accountId}-${categoryId}`),
      enabled
    }))
  });

  // TODO: instead of extracting the data here and ensuring that the combined
  // data does not change on re-renders with useMemo, the combine feature of TanStack
  // query should be used when upgrading to TanStack Query v5
  const allData = combinedQueries.map(query => query.data);
  const combinedData = useMemo(
    () =>
      allData.reduce<StarlingFeedItem[]>(
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
    isSuccess: combinedQueries.every(query => query.isSuccess)
  };
};

export default useGetStarlingTransactions;
