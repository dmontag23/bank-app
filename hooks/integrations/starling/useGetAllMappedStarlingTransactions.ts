import {mapStarlingTransactionToInternalTransaction} from "./starlingMappings";
import useGetStarlingAccounts from "./useGetStarlingAccounts";
import useGetStarlingTransactions from "./useGetStarlingTransactions";

import {DateRange} from "../../../types/transaction";
import useMapTransactionsToInternalTransactions from "../../transactions/useMapTransactionsToInternalTransactions";

type UseGetAllMappedStarlingTransactionsProps = {dateRange?: DateRange};

const useGetAllMappedStarlingTransactions = ({
  dateRange
}: UseGetAllMappedStarlingTransactionsProps = {}) => {
  const {
    isLoading: isStarlingAccountsLoading,
    isRefetching: isStarlingAccountsRefetching,
    data: starlingAccountsData,
    refetch: refetchAccountsData
  } = useGetStarlingAccounts();

  const ids =
    starlingAccountsData?.map(account => ({
      accountId: account.accountUid,
      categoryId: account.defaultCategory
    })) ?? [];

  const {
    isLoading: isStarlingTransactionsLoading,
    data: starlingTransactions,
    isRefetching: isStarlingTransactionsRefetching
  } = useGetStarlingTransactions({
    ids,
    dateRange,
    enabled: !(isStarlingAccountsLoading || isStarlingAccountsRefetching)
  });

  const isMapEnabled = Boolean(starlingTransactions.length);

  const {transactions, isLoading: isMapLoading} =
    useMapTransactionsToInternalTransactions({
      transactions: starlingTransactions,
      mapTransactionToInternalTransaction:
        mapStarlingTransactionToInternalTransaction,
      enabled: isMapEnabled
    });

  return {
    isLoading:
      isStarlingAccountsLoading ||
      isStarlingTransactionsLoading ||
      (isMapLoading && isMapEnabled),
    isRefetching:
      isStarlingAccountsRefetching || isStarlingTransactionsRefetching,
    transactions,
    // only refetchAccountsData is called here because, as soon as the account data is refetched,
    // the transaction queries are disabled. After the account query is finished, the transaction
    // query is enabled again, which triggers an automatic refetch of the transaction data
    refetch: refetchAccountsData
  };
};

export default useGetAllMappedStarlingTransactions;
