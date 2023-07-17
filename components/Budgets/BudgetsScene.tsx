import React, {useState} from "react";
import {StyleSheet, View} from "react-native";
import {Text} from "react-native-paper";

import Budget from "./Budget";
import BudgetHeader from "./BudgetHeader";

import {Budget as BudgetType} from "../../types/budget";

const BudgetsScene = () => {
  const [selectedBudget, setSelectedBudget] = useState<BudgetType | null>(null);

  return (
    <>
      <BudgetHeader
        selectedBudget={selectedBudget}
        setSelectedBudget={setSelectedBudget}
      />
      {selectedBudget ? (
        <Budget budget={selectedBudget} />
      ) : (
        <View style={styles.container}>
          <Text variant="headlineLarge" style={styles.text}>
            Please select a budget
          </Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: "center"},
  text: {textAlign: "center"}
});

export default BudgetsScene;
