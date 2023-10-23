import React, {useState} from "react";
import {StyleSheet, View} from "react-native";
import {IconButton, ProgressBar, Text, useTheme} from "react-native-paper";

import BudgetDialog from "./BudgetDialog";

import {Budget, BudgetItemWithTransactions} from "../../types/budget";

type BudgetItemSummaryProps = {
  item: BudgetItemWithTransactions;
  budget: Budget;
  setSelectedBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
};

const BudgetItemSummary = ({
  item,
  budget,
  setSelectedBudget
}: BudgetItemSummaryProps) => {
  const theme = useTheme();

  const [isBudgetDialogVisible, setIsBudgetDialogVisible] = useState(false);
  const showBudgetDialog = () => setIsBudgetDialogVisible(true);
  const hideBudgetDialog = () => setIsBudgetDialogVisible(false);

  const amtLeft = item.cap - item.spent;
  const percentLeft = item.cap !== 0 ? amtLeft / item.cap : 0;

  return (
    <>
      <BudgetDialog
        isVisible={isBudgetDialogVisible}
        hide={hideBudgetDialog}
        setSelectedBudget={setSelectedBudget}
        isEditing={true}
        formValues={budget}
      />
      <View style={styles.titleContainer}>
        {/* This view is here to pad the left side of the screen to ensure that the title
        is centered and the edit button is on the right hand side of the title */}
        <View style={styles.titleSideItems} />
        <Text variant="displayMedium" style={styles.title}>
          {item.name}
        </Text>
        <View style={styles.titleSideItems}>
          <IconButton
            icon="pencil"
            mode="contained-tonal"
            size={20}
            onPress={showBudgetDialog}
          />
        </View>
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
          progress={percentLeft > 0 ? percentLeft : 0}
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
  amountsContainer: {flex: 1.6, justifyContent: "center", alignItems: "center"},
  amountsTextContainer: {alignItems: "flex-end"},
  progressBarContainer: {flex: 1, justifyContent: "center"},
  progressBar: {width: "80%", height: 20, borderRadius: 8, alignSelf: "center"},
  titleContainer: {flex: 1, flexDirection: "row", justifyContent: "center"},
  titleSideItems: {flex: 1.5, justifyContent: "center", paddingLeft: 15},
  title: {textAlign: "center", textAlignVertical: "center"}
});

export default BudgetItemSummary;
