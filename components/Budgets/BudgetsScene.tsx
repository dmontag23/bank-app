import React, {useState} from "react";
import {StyleSheet, View} from "react-native";
import {Text} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import Budget from "./Budget";
import BudgetHeader from "./BudgetHeader";

import {Budget as BudgetType} from "../../types/budget";

const BudgetsScene = () => {
  const [selectedBudget, setSelectedBudget] = useState<BudgetType | null>(null);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        ...styles.container,
        paddingTop: insets.top
      }}>
      <BudgetHeader
        selectedBudget={selectedBudget}
        setSelectedBudget={setSelectedBudget}
      />
      {selectedBudget ? (
        <Budget budget={selectedBudget} />
      ) : (
        <View style={styles.budgetTextContainer}>
          <Text variant="headlineLarge" style={styles.text}>
            Please select a budget
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  budgetTextContainer: {flex: 1, justifyContent: "center"},
  container: {flex: 1},
  text: {textAlign: "center"}
});

export default BudgetsScene;
