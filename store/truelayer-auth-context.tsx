import React, {createContext} from "react";

import useGetTruelayerTokens from "../hooks/integrations/truelayer/useGetTruelayerTokens";

const TruelayerAuthContext = createContext({
  isLoading: true,
  authToken: "",
  refreshToken: ""
});

type TruelayerAuthContextProviderProps = {
  children: React.ReactNode;
};

export const TruelayerAuthContextProvider = ({
  children
}: TruelayerAuthContextProviderProps) => {
  const {isLoading, data: tokens} = useGetTruelayerTokens();

  return (
    <TruelayerAuthContext.Provider
      value={{
        isLoading,
        authToken: tokens?.authToken ?? "",
        refreshToken: tokens?.refreshToken ?? ""
      }}>
      {children}
    </TruelayerAuthContext.Provider>
  );
};

export default TruelayerAuthContext;
