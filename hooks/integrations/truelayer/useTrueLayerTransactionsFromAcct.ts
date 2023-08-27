import {useQuery} from "@tanstack/react-query";

import {trueLayerDataApi} from "../../../api/axiosConfig";
import {AppError} from "../../../types/errors";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";

const getTransactions = async (acctId: string) =>
  await trueLayerDataApi.get<CardTransaction[]>(
    `v1/cards/${acctId}/transactions`
  );

const useTrueLayerTransactionsFromAcct = (acctId: string) =>
  useQuery<CardTransaction[], AppError>({
    queryKey: ["trueLayerTransactions", acctId],
    queryFn: () => getTransactions(acctId)
  });

export default useTrueLayerTransactionsFromAcct;
