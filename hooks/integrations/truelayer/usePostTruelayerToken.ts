import {useContext} from "react";
import {useMutation} from "@tanstack/react-query";

import {trueLayerAuthApi} from "../../../api/axiosConfig";
import Config from "../../../config.json";
import ErrorContext from "../../../store/error-context";
import {IntegrationErrorResponse} from "../../../types/errors";
import {
  ConnectTokenPostRequest,
  ConnectTokenPostResponse,
  GrantType
} from "../../../types/trueLayer/authAPI/auth";

const exchangeCodeForAccessToken = async (code: string) =>
  await trueLayerAuthApi.post<
    ConnectTokenPostRequest,
    ConnectTokenPostResponse
  >("connect/token", {
    grant_type: GrantType.AUTHORIZATION_CODE,
    client_id: Config.TRUELAYER_CLIENT_ID,
    client_secret: Config.TRUELAYER_CLIENT_SECRET,
    redirect_uri: `${Config.URI}${Config.TRUELAYER_CALLBACK_ENDPOINT}`,
    code
  });

const usePostTruelayerToken = () => {
  const {addError, removeError} = useContext(ErrorContext);

  return useMutation<
    ConnectTokenPostResponse,
    IntegrationErrorResponse,
    string
  >({
    mutationFn: exchangeCodeForAccessToken,
    onError: error => addError({...error, id: "usePostTruelayerToken"}),
    onSuccess: () => removeError("usePostTruelayerToken")
  });
};

export default usePostTruelayerToken;
