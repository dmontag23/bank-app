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

const useGetTruelayerTransactions = (
  cardId: string,
  dateRange?: TransactionDateRangeQuery
) => {
  const {addError, removeError} = useContext(ErrorContext);

  return useQuery<CardTransaction[], IntegrationErrorResponse>({
    queryKey: ["truelayerTransactions", cardId, dateRange],
    queryFn: () => getTransactions(cardId, dateRange),
    onError: error => addError({...error, id: "useGetTruelayerTransactions"}),
    onSuccess: () => removeError("useGetTruelayerTransactions")
  });
};

export default useGetTruelayerTransactions;
