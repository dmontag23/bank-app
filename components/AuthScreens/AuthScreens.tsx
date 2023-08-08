import React from "react";
import {createStackNavigator} from "@react-navigation/stack";

import ThirdPartyConnections from "./ThirdPartyConnections";
import TruelayerAuthValidation from "./Truelayer/TruelayerAuthValidation";
import TruelayerWebAuth from "./Truelayer/TruelayerWebAuth";

import {TruelayerAuthStackParamList} from "../../types/screens";

const Stack = createStackNavigator<TruelayerAuthStackParamList>();

const AuthScreens = () => (
  <Stack.Navigator
    screenOptions={{animationEnabled: false, headerShown: false}}>
    <Stack.Screen
      name="ThirdPartyConnections"
      component={ThirdPartyConnections}
    />
    <Stack.Screen name="TruelayerWebAuth" component={TruelayerWebAuth} />
    <Stack.Screen
      name="TruelayerAuthValidation"
      component={TruelayerAuthValidation}
    />
  </Stack.Navigator>
);

export default AuthScreens;
