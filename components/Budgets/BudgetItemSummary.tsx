import React from "react";
import {StyleSheet, View} from "react-native";
import {ProgressBar, Text, useTheme} from "react-native-paper";

import {BudgetItemWithTransactions} from "../../types/budget";

type BudgetItemSummaryProps = {
  item: BudgetItemWithTransactions;
};

const BudgetItemSummary = ({item}: BudgetItemSummaryProps) => {
  const theme = useTheme();

  const amtLeft = item.cap - item.spent;
  const percentLeft = item.cap !== 0 ? amtLeft / item.cap : 0;

  return (
    <>
      <View style={styles.titleContainer}>
        <Text variant="displaySmall">{item.name}</Text>
      </View>
      <View style={styles.amountsContainer}>
        <View style={styles.amountsTextContainer}>
          <Text variant="displayMedium">
            {/* TODO: Make the currency dynamic, also might want to consider
            toLocaleString instead of toFixed to avoid rounding issues with toFixed */}
            £{(Math.round((amtLeft + Number.EPSILON) * 100) / 100).toFixed(2)}
          </Text>
          <Text variant="labelLarge">left of £{item.cap.toFixed(2)}</Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <ProgressBar
          animatedValue={percentLeft > 0 ? percentLeft : 0}
          style={[
            styles.progressBar,
            {
              backgroundColor:
                percentLeft < 0
                  ? theme.colors.errorContainer
                  : theme.colors.primaryContainer
            },
            ...(percentLeft < 0
              ? [{borderColor: theme.colors.error, borderWidth: 1}]
              : [])
          ]}
          testID="budgetItemSummaryProgressBar"
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  amountsContainer: {flex: 2, justifyContent: "center", alignItems: "center"},
  amountsTextContainer: {alignItems: "flex-end"},
  progressBarContainer: {flex: 1, justifyContent: "center"},
  progressBar: {width: "80%", height: 20, borderRadius: 8, alignSelf: "center"},
  titleContainer: {flex: 1, justifyContent: "center", alignItems: "center"}
});

export default BudgetItemSummary;
