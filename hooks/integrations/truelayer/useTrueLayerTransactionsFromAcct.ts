import {useContext} from "react";
import {useQuery} from "@tanstack/react-query";

import {trueLayerDataApi} from "../../../api/axiosConfig";
import ErrorContext from "../../../store/error-context";
import {IntegrationErrorResponse} from "../../../types/errors";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";

const getTransactions = async (acctId: string) =>
  await trueLayerDataApi.get<CardTransaction[]>(
    `v1/cards/${acctId}/transactions`
  );

const useTrueLayerTransactionsFromAcct = (acctId: string) => {
  const {addError, removeError} = useContext(ErrorContext);

  return useQuery<CardTransaction[], IntegrationErrorResponse>({
    queryKey: ["trueLayerTransactions", acctId],
    queryFn: () => getTransactions(acctId),
    onError: error =>
      addError({...error, id: "useTrueLayerTransactionsFromAcct"}),
    onSuccess: () => removeError("useTrueLayerTransactionsFromAcct")
  });
};

export default useTrueLayerTransactionsFromAcct;
