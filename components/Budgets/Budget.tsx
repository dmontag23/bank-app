import React, {useMemo} from "react";
import {StyleSheet, View} from "react-native";
import {Avatar, Text} from "react-native-paper";
import {createMaterialTopTabNavigator} from "@react-navigation/material-top-tabs";

import BudgetItem from "./BudgetItem";

import useGetCategoryMap from "../../hooks/transactions/useGetCategoryMap";
import useGetTransactions from "../../hooks/transactions/useGetTransactions";
import {useAppTheme} from "../../hooks/utils/useAppTheme";
import {
  BudgetItem as BudgetItemType,
  BudgetItemWithTransactions,
  Budget as BudgetType
} from "../../types/budget";
import {Transaction} from "../../types/transaction";
import LoadingSpinner from "../ui/LoadingSpinner";

const Tab = createMaterialTopTabNavigator();

const categorizeTransactions = (
  transactions: Transaction[],
  budgetItems: BudgetItemType[]
) =>
  transactions.reduce<BudgetItemWithTransactions[]>(
    (allBudgetItems, curTransaction) =>
      allBudgetItems.map(item =>
        item.categories.includes(curTransaction.category)
          ? {
              ...item,
              spent: item.spent + Math.abs(curTransaction.amount),
              transactions: [...item.transactions, curTransaction]
            }
          : item
      ),
    budgetItems.map<BudgetItemWithTransactions>(item => ({
      ...item,
      spent: 0,
      transactions: []
    }))
  );

const renderTabBarIcon =
  (focusedColor: string) =>
  ({focused}: {focused: boolean}) =>
    (
      <Avatar.Icon
        size={15}
        icon="circle"
        color={focused ? focusedColor : "transparent"}
      />
    );

type BudgetProps = {
  budget: BudgetType;
  setSelectedBudget: React.Dispatch<React.SetStateAction<BudgetType | null>>;
};

const Budget = ({budget, setSelectedBudget}: BudgetProps) => {
  const theme = useAppTheme();

  // TODO: Investigate why mounting or refetching this component
  // also calls the endpoints to get all transactions (i.e. not just the transactions
  // filtered by date)
  const {
    isLoading: isTransactionsLoading,
    transactions,
    isRefetching: isTransactionsRefetching,
    refetch: refetchTransactions
  } = useGetTransactions({
    dateRange: {
      from: budget.window.start,
      to: budget.window.end
    }
  });

  const {isLoading: isCategoryMapLoading, data: categoryMap} =
    useGetCategoryMap();

  const budgetItemsWithTransactions = useMemo(
    () => categorizeTransactions(transactions, budget.items),
    [budget.items, transactions]
  );

  return (
    <View style={styles.container}>
      {isTransactionsLoading || isCategoryMapLoading ? (
        <LoadingSpinner />
      ) : budgetItemsWithTransactions.length ? (
        <Tab.Navigator
          // TODO: Investigate if this can be removed
          // This should be the default behavior, however,
          // the jest tests fails (even though it registers
          // the tab press has happened) if this is removed
          screenListeners={({navigation, route}) => ({
            tabPress: e => {
              e.preventDefault();
              navigation.navigate(route.name);
            }
          })}
          screenOptions={{
            tabBarIcon: renderTabBarIcon(theme.colors.background),
            tabBarContentContainerStyle: styles.tabBarContainer,
            tabBarIndicator: () => null,
            tabBarItemStyle: styles.tab,
            tabBarShowLabel: false
          }}
          tabBarPosition="bottom">
          {budgetItemsWithTransactions.map(item => (
            <Tab.Screen key={item.id} name={item.id}>
              {/* TODO: use context here, see https://reactnavigation.org/docs/hello-react-navigation#passing-additional-props */}
              {props => (
                <BudgetItem
                  {...props}
                  item={item}
                  budget={budget}
                  setSelectedBudget={setSelectedBudget}
                  categoryMap={categoryMap ?? {}}
                  onRefetchTransactions={refetchTransactions}
                  isRefetchingTransactions={isTransactionsRefetching}
                />
              )}
            </Tab.Screen>
          ))}
        </Tab.Navigator>
      ) : (
        <Text variant="headlineLarge" style={styles.text}>
          There are no items in this budget.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: "center"},
  tab: {width: "auto"},
  tabBarContainer: {justifyContent: "center"},
  text: {textAlign: "center"}
});

export default Budget;
