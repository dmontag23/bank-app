import React, {memo} from "react";
import {StyleSheet, View} from "react-native";
import {Text} from "react-native-paper";
import {isEqual} from "lodash";

import BudgetItemSummary from "./BudgetItemSummary";

import {Budget, BudgetItemWithTransactions} from "../../types/budget";
import TransactionList from "../Transactions/TransactionList";

type BudgetItemProps = {
  item: BudgetItemWithTransactions;
  budget: Budget;
  setSelectedBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
};

const BudgetItem = ({item, budget, setSelectedBudget}: BudgetItemProps) => (
  <View style={styles.container}>
    <View style={styles.summaryContainer}>
      <BudgetItemSummary
        item={item}
        budget={budget}
        setSelectedBudget={setSelectedBudget}
      />
    </View>
    <View style={styles.transactionsContainer}>
      {item.transactions.length === 0 ? (
        <Text variant="headlineMedium" style={styles.text}>
          There are currently no transactions for this budget item.
        </Text>
      ) : (
        <TransactionList transactions={item.transactions} />
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1, gap: 30},
  summaryContainer: {flex: 1},
  text: {padding: 35, textAlign: "center"},
  transactionsContainer: {flex: 2}
});

export default memo(BudgetItem, (prevProps, nextProps) =>
  isEqual(prevProps, nextProps)
);
