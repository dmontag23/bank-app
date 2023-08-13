import React from "react";
import {View} from "react-native";
import {Text} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {createMaterialBottomTabNavigator} from "@react-navigation/material-bottom-tabs";

import BudgetsScreen from "./Budgets/BudgetsScreen";
import TransactionsScreen from "./Transactions/TransactionsScreen";

const Tab = createMaterialBottomTabNavigator();
const ICON_SIZE = 24;

const budgetsIcon = (focused: boolean) => (
  <MaterialCommunityIcons
    name={focused ? "account-cash" : "account-cash-outline"}
    size={ICON_SIZE}
  />
);

const transactionsIcon = (focused: boolean) => (
  <MaterialCommunityIcons
    name={focused ? "bank" : "bank-outline"}
    size={ICON_SIZE}
  />
);

const settingsIcon = (focused: boolean) => (
  <MaterialCommunityIcons
    name={focused ? "cog" : "cog-outline"}
    size={ICON_SIZE}
  />
);

const Settings = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{paddingTop: insets.top}}>
      <Text>All settings</Text>
    </View>
  );
};

const LoggedInScreens = () => (
  <Tab.Navigator>
    <Tab.Screen
      name="Budgets"
      component={BudgetsScreen}
      options={{
        tabBarIcon: ({focused}) => budgetsIcon(focused),
        tabBarTestID: "budgetsBottomNavButton"
      }}
    />
    <Tab.Screen
      name="Transactions"
      component={TransactionsScreen}
      options={{
        tabBarIcon: ({focused}) => transactionsIcon(focused),
        tabBarTestID: "transactionsBottomNavButton"
      }}
    />
    <Tab.Screen
      name="Settings"
      component={Settings}
      options={{
        tabBarIcon: ({focused}) => settingsIcon(focused),
        tabBarTestID: "settingsBottomNavButton"
      }}
    />
  </Tab.Navigator>
);

export default LoggedInScreens;
