import AsyncStorage from "@react-native-async-storage/async-storage";
import {useQuery} from "@tanstack/react-query";

const getTruelayerTokensFromStorage = async () => {
  const tokenMappings = await AsyncStorage.multiGet([
    "truelayer-auth-token",
    "truelayer-refresh-token"
  ]);
  return {authToken: tokenMappings[0][1], refreshToken: tokenMappings[1][1]};
};

const useGetTruelayerTokens = () =>
  useQuery({
    queryKey: ["truelayerTokens"],
    queryFn: () => getTruelayerTokensFromStorage()
  });

export default useGetTruelayerTokens;
