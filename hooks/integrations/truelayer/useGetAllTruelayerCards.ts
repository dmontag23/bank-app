import {useContext} from "react";
import {useQuery} from "@tanstack/react-query";

import {trueLayerDataApi} from "../../../api/axiosConfig";
import ErrorContext from "../../../store/error-context";
import {IntegrationErrorResponse} from "../../../types/errors";
import {Card} from "../../../types/trueLayer/dataAPI/cards";

const getCards = async () => await trueLayerDataApi.get<Card[]>("v1/cards");

const useGetAllTruelayerCards = () => {
  const {addError, removeError} = useContext(ErrorContext);

  return useQuery<Card[], IntegrationErrorResponse>({
    queryKey: ["truelayerCards"],
    queryFn: getCards,
    onError: error => addError({...error, id: "useGetAllTruelayerCards"}),
    onSuccess: () => removeError("useGetAllTruelayerCards")
  });
};

export default useGetAllTruelayerCards;
