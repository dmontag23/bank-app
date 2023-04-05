import {mapTrueLayerTransactionToInternalTransaction} from "./integrations/truelayer/trueLayerMappings";
import useTrueLayerTransactionsFromAcct from "./integrations/truelayer/useTrueLayerTransactionsFromAcct";

const useTransactions = (acctId: string) => {
  const {isLoading, data} = useTrueLayerTransactionsFromAcct(acctId);
  const internalTransactions = (data ?? []).map(transaction =>
    mapTrueLayerTransactionToInternalTransaction(transaction)
  );
  return {isLoading, transactions: internalTransactions};
};

export default useTransactions;
