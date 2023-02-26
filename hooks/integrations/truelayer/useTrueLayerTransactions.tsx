import {useQuery} from "@tanstack/react-query";

import trueLayerDataApi from "../../../axiosConfig";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";
import {DataAPISuccessResponse} from "../../../types/trueLayer/dataAPI/serverResponse";

const getTransactions = async (acctId: string) => {
  const data = await trueLayerDataApi.get<
    DataAPISuccessResponse<CardTransaction[]>,
    CardTransaction[]
  >(`data/v1/cards/${acctId}/transactions`);
  console.log(
    "DATA",
    data.map(trans => trans.amount)
  );
  return data ?? [];
};

const useTrueLayerTransactionsFromAcct = (acctId: string) => {
  return useQuery({
    queryKey: ["trueLayerTransactions", acctId],
    queryFn: () => getTransactions(acctId)
  });
};

export default useTrueLayerTransactionsFromAcct;
