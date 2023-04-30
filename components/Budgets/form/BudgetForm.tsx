import React from "react";
import {ScrollView, StyleSheet, View} from "react-native";
import {TextInput} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

import BudgetItemForm from "./BudgetItemForm";

import {BudgetInput} from "../../../types/budget";

type BudgetFormProps = {
  budget: BudgetInput;
  setBudget: React.Dispatch<React.SetStateAction<BudgetInput>>;
};

// TODO: Add validation to this form
const BudgetForm = ({budget, setBudget}: BudgetFormProps) => (
  <ScrollView contentContainerStyle={styles.container}>
    <TextInput
      label="Name"
      accessibilityLabel="Name"
      value={budget.name}
      onChangeText={name =>
        setBudget(prevBudgetFormValues => ({...prevBudgetFormValues, name}))
      }
      style={styles.textInput}
    />
    <View style={styles.dateContainer}>
      <DateTimePicker
        accessibilityLabel="Start date"
        value={budget.window.start}
        onChange={(event, newStartDate) => {
          if (newStartDate)
            setBudget(prevBudgetFormValues => ({
              ...prevBudgetFormValues,
              window: {
                ...prevBudgetFormValues.window,
                start: newStartDate
              }
            }));
        }}
      />
      <DateTimePicker
        accessibilityLabel="End date"
        value={budget.window.end}
        onChange={(event, newEndDate) => {
          if (newEndDate)
            setBudget(prevBudgetFormValues => ({
              ...prevBudgetFormValues,
              window: {
                ...prevBudgetFormValues.window,
                end: newEndDate
              }
            }));
        }}
      />
    </View>
    <BudgetItemForm budget={budget} setBudget={setBudget} />
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {marginBottom: 20, marginRight: 10},
  dateContainer: {flexDirection: "row", marginBottom: 20},
  textInput: {marginBottom: 20}
});

export default BudgetForm;
