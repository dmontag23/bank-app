import React, {useContext} from "react";
import {createStackNavigator} from "@react-navigation/stack";

import ThirdPartyConnections from "./AuthScreens/ThirdPartyConnections";
import TruelayerAuthValidation from "./AuthScreens/Truelayer/TruelayerAuthValidation";
import TruelayerWebAuth from "./AuthScreens/Truelayer/TruelayerWebAuth";
import LoggedInScreens from "./LoggedInScreens";
import CenteredLoadingSpinner from "./ui/CenteredLoadingSpinner";

import TruelayerAuthContext from "../store/truelayer-auth-context";
import {RootStackParamList} from "../types/screens";

const Stack = createStackNavigator<RootStackParamList>();

const RootScreens = () => {
  const {isLoading, authToken: truelayerAuthToken} =
    useContext(TruelayerAuthContext);

  if (isLoading) return <CenteredLoadingSpinner />;

  return (
    <Stack.Navigator
      screenOptions={{animationEnabled: false, headerShown: false}}>
      <Stack.Screen
        name="AppViews"
        component={truelayerAuthToken ? LoggedInScreens : ThirdPartyConnections}
      />
      <Stack.Screen name="TruelayerWebAuth" component={TruelayerWebAuth} />
      <Stack.Screen
        name="TruelayerAuthValidation"
        component={TruelayerAuthValidation}
      />
    </Stack.Navigator>
  );
};

export default RootScreens;
