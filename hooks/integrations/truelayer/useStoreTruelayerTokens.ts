import {useContext} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useMutation, useQueryClient} from "@tanstack/react-query";

import ErrorContext from "../../../store/error-context";

const storeTruelayerTokens = async (tokens: {
  authToken: string;
  refreshToken: string;
}) => {
  const mappingArray: [string, string][] = [
    ["truelayer-auth-token", tokens.authToken],
    ["truelayer-refresh-token", tokens.refreshToken]
  ];
  await AsyncStorage.multiSet(mappingArray);
  return tokens;
};

const useStoreTruelayerTokens = () => {
  const queryClient = useQueryClient();
  const {addError, removeError} = useContext(ErrorContext);

  return useMutation({
    mutationFn: storeTruelayerTokens,
    // Always refetch all truelayer tokens after success or error
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["truelayerTokens"]
      });
    },
    onError: error =>
      addError({
        id: "useStoreTruelayerTokens",
        error: "AsyncStorage - Store tokens",
        errorMessage: `There was a problem storing the Truelayer auth and refresh tokens in AsyncStorage: ${JSON.stringify(
          error
        )}`
      }),
    onSuccess: () => removeError("useStoreTruelayerTokens")
  });
};

export default useStoreTruelayerTokens;
