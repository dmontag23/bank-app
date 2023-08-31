import {useContext} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useQuery} from "@tanstack/react-query";

import ErrorContext from "../../../store/error-context";

const getTruelayerTokensFromStorage = async () => {
  const tokenMappings = await AsyncStorage.multiGet([
    "truelayer-auth-token",
    "truelayer-refresh-token"
  ]);
  return {authToken: tokenMappings[0][1], refreshToken: tokenMappings[1][1]};
};

const useGetTruelayerTokens = () => {
  const {addError, removeError} = useContext(ErrorContext);

  return useQuery({
    queryKey: ["truelayerTokens"],
    queryFn: () => getTruelayerTokensFromStorage(),
    onError: error =>
      addError({
        id: "useGetTruelayerTokens",
        error: "AsyncStorage - Get tokens",
        errorMessage: `There was a problem getting the Truelayer auth and refresh tokens from AsyncStorage: ${JSON.stringify(
          error
        )}`
      }),
    onSuccess: () => removeError("useGetTruelayerTokens")
  });
};

export default useGetTruelayerTokens;
