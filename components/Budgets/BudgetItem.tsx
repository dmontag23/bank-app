import React, {memo} from "react";
import {StyleSheet, View} from "react-native";
import {Text} from "react-native-paper";
import {isEqual} from "lodash";

import BudgetItemSummary from "./BudgetItemSummary";

import {Budget, BudgetItemWithTransactions} from "../../types/budget";
import {CategoryMap} from "../../types/transaction";
import TransactionList from "../Transactions/TransactionList";

type BudgetItemProps = {
  item: BudgetItemWithTransactions;
  budget: Budget;
  setSelectedBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
  categoryMap: CategoryMap;
};

const BudgetItem = ({
  item,
  budget,
  setSelectedBudget,
  categoryMap
}: BudgetItemProps) => (
  <View style={styles.container}>
    <BudgetItemSummary
      item={item}
      budget={budget}
      setSelectedBudget={setSelectedBudget}
      categoryMap={categoryMap}
    />
    {item.transactions.length === 0 ? (
      <Text variant="headlineMedium" style={styles.text}>
        There are currently no transactions for this budget item.
      </Text>
    ) : (
      <TransactionList
        transactions={item.transactions}
        categoryMap={categoryMap}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1},
  text: {padding: 35, textAlign: "center"}
});

export default memo(BudgetItem, (prevProps, nextProps) =>
  isEqual(prevProps, nextProps)
);
