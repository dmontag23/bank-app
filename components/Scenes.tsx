import React from "react";
import {View} from "react-native";
import {Text} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {createMaterialBottomTabNavigator} from "@react-navigation/material-bottom-tabs";

import BudgetsScene from "./Budgets/BudgetsScene";
import TransactionsScene from "./Transactions/TransactionsScene";

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

const Screens = () => (
  <Tab.Navigator>
    <Tab.Screen
      name="Budgets"
      component={BudgetsScene}
      options={{
        tabBarIcon: ({focused}) => budgetsIcon(focused)
      }}
    />
    <Tab.Screen
      name="Transactions"
      component={TransactionsScene}
      options={{
        tabBarIcon: ({focused}) => transactionsIcon(focused)
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

export default Screens;
