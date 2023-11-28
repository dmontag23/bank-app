import useGetTransactionCategoryMap from "./useGetTransactionCategoryMap";

import {Source, Transaction} from "../../types/transaction";

type UseMapTransactionsToInternalTransactionsProps<T> = {
  transactions: T[];
  mapTransactionToInternalTransaction: (transaction: T) => Transaction;
  enabled?: boolean;
};

const useMapTransactionsToInternalTransactions = <T>({
  transactions,
  mapTransactionToInternalTransaction,
  enabled = true
}: UseMapTransactionsToInternalTransactionsProps<T>) => {
  const internalTransactions = transactions.map(transaction =>
    mapTransactionToInternalTransaction(transaction)
  );

  const source = internalTransactions[0]?.source ?? Source.UNKNOWN;

  const {isLoading, data: transactionToCategoryMap} =
    useGetTransactionCategoryMap({
      transactionIds: internalTransactions.map(({id}) => id),
      source,
      enabled
    });

  // ensure the internal transactions use the categories from storage
  const trxsWithMergedCategories = internalTransactions.reduce<Transaction[]>(
    (mergedTransactions, transaction) => {
      const prevSavedCategory = (transactionToCategoryMap ?? {})[
        transaction.id
      ];
      return [
        ...mergedTransactions,
        prevSavedCategory
          ? {...transaction, category: prevSavedCategory}
          : transaction
      ];
    },
    []
  );

  return {
    isLoading,
    transactions: trxsWithMergedCategories
  };
};

export default useMapTransactionsToInternalTransactions;
