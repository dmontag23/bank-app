import {useQuery} from "@tanstack/react-query";

import {trueLayerDataApi} from "../../../axiosConfig";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";
import {DataAPIErrorResponse} from "../../../types/trueLayer/dataAPI/serverResponse";

const getTransactions = async (acctId: string) =>
  await trueLayerDataApi.get<CardTransaction[]>(
    `data/v1/cards/${acctId}/transactions`
  );

const useTrueLayerTransactionsFromAcct = (acctId: string) =>
  useQuery<CardTransaction[], DataAPIErrorResponse>({
    queryKey: ["trueLayerTransactions", acctId],
    queryFn: () => getTransactions(acctId)
  });

export default useTrueLayerTransactionsFromAcct;
