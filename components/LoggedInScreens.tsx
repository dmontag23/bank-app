import React, {useContext} from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {createMaterialBottomTabNavigator} from "@react-navigation/material-bottom-tabs";

import BudgetsScreen from "./Budgets/BudgetsScreen";
import SettingsScreen from "./Settings/SettingsScreen";
import AddCategory from "./Transactions/AddCategory";
import TransactionsScreen from "./Transactions/TransactionsScreen";

import ErrorContext from "../store/error-context";
import {LoggedInTabParamList} from "../types/screens";

const Tab = createMaterialBottomTabNavigator<LoggedInTabParamList>();
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

const LoggedInScreens = () => {
  const {errors} = useContext(ErrorContext);
  const tabBarBadgeObject = errors.length ? {tabBarBadge: errors.length} : {};
  return (
    <>
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
          component={SettingsScreen}
          options={{
            tabBarIcon: ({focused}) => settingsIcon(focused),
            tabBarTestID: "settingsBottomNavButton",
            ...tabBarBadgeObject
          }}
        />
      </Tab.Navigator>
      <AddCategory />
    </>
  );
};

export default LoggedInScreens;
