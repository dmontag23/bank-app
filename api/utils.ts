// TODO: Maybe use secure storage for tokens
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getTokenFromStorage = async (tokenName: string) => {
  try {
    return await AsyncStorage.getItem(tokenName);
  } catch (error: unknown) {
    return Promise.reject({
      name: `Cannot fetch AsyncStorage ${tokenName} token`,
      message: `An error occurred when trying to fetch the token from storage: ${error}`
    });
  }
};
