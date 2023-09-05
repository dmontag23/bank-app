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

const getTransactions = async (
  acctId: string,
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
    `v1/cards/${acctId}/transactions${queryParams}`
  );
};

const useGetTruelayerTransactions = (
  acctId: string,
  dateRange?: TransactionDateRangeQuery
) => {
  const {addError, removeError} = useContext(ErrorContext);

  return useQuery<CardTransaction[], IntegrationErrorResponse>({
    queryKey: ["trueLayerTransactions", acctId, dateRange],
    queryFn: () => getTransactions(acctId, dateRange),
    onError: error =>
      addError({...error, id: "useTrueLayerTransactionsFromAcct"}),
    onSuccess: () => removeError("useTrueLayerTransactionsFromAcct")
  });
};

export default useGetTruelayerTransactions;
