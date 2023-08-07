import {useMutation} from "@tanstack/react-query";

import {trueLayerAuthApi} from "../../../axiosConfig";
import config from "../../../config.json";
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
    client_id: config.integrations.trueLayer.clientId,
    client_secret: config.integrations.trueLayer.clientSecret,
    redirect_uri: `${config.uri}${config.integrations.trueLayer.callbackEndpoint}`,
    code
  });

const usePostTruelayerToken = () =>
  useMutation({
    mutationFn: exchangeCodeForAccessToken
  });

export default usePostTruelayerToken;
