import {useContext} from "react";
import {useQuery} from "@tanstack/react-query";

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
  acctId: string,
  dateRange?: TransactionDateRangeQuery
) =>
  (
    await trueLayerDataApi.get<CardTransaction[]>(
      `v1/cards/${acctId}/transactions/pending`
    )
  ).filter(transaction => {
    if (!dateRange) return true;
    const transactionTimestamp = new Date(transaction.timestamp);
    return (
      dateRange.from <= transactionTimestamp &&
      transactionTimestamp <= dateRange.to
    );
  });

const useGetTruelayerPendingTransactions = (
  acctId: string,
  dateRange?: TransactionDateRangeQuery
) => {
  const {addError, removeError} = useContext(ErrorContext);

  return useQuery<CardTransaction[], IntegrationErrorResponse>({
    queryKey: ["truelayerPendingTransactions", acctId, dateRange],
    queryFn: () => getPendingTransactions(acctId, dateRange),
    onError: error =>
      addError({...error, id: "useGetTruelayerPendingTransactions"}),
    onSuccess: () => removeError("useGetTruelayerPendingTransactions")
  });
};

export default useGetTruelayerPendingTransactions;
