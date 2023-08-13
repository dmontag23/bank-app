import AsyncStorage from "@react-native-async-storage/async-storage";
import {useMutation, useQueryClient} from "@tanstack/react-query";

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

  return useMutation({
    mutationFn: storeTruelayerTokens,
    // Always refetch all truelayer tokens after success or error
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["truelayerTokens"]
      });
    }
  });
};

export default useStoreTruelayerTokens;
