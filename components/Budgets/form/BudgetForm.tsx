import React from "react";
import {Control, Controller} from "react-hook-form";
import {ScrollView, StyleSheet, View} from "react-native";
import {TextInput} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

import BudgetItemForm from "./BudgetItemForm";

import {BudgetInput} from "../../../types/budget";

type BudgetFormProps = {
  control: Control<BudgetInput>;
};

// TODO: Add validation to this form
const BudgetForm = ({control}: BudgetFormProps) => (
  <ScrollView
    contentContainerStyle={styles.container}
    testID="budgetFormScrollView">
    <Controller
      control={control}
      render={({field: {onChange, onBlur, value}}) => (
        <TextInput
          label="Name"
          accessibilityLabel="Name"
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          style={styles.textInput}
          testID="budgetNameInput"
        />
      )}
      name="name"
    />
    <View style={styles.dateContainer}>
      <Controller
        control={control}
        render={({field: {onChange, value}}) => (
          <DateTimePicker
            accessibilityLabel="Start date"
            value={value}
            onChange={(event, newStartDate) => {
              if (newStartDate) onChange(newStartDate);
            }}
          />
        )}
        name="window.start"
      />
      <Controller
        control={control}
        render={({field: {onChange, value}}) => (
          <DateTimePicker
            accessibilityLabel="End date"
            value={value}
            onChange={(event, newEndDate) => {
              if (newEndDate) onChange(newEndDate);
            }}
          />
        )}
        name="window.end"
      />
    </View>
    <BudgetItemForm control={control} />
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {marginBottom: 20, marginRight: 10},
  dateContainer: {
    flexDirection: "row",
    marginBottom: 20,
    marginLeft: -5, // TODO: investigate why this is needed to align date with start of name input
    justifyContent: "space-between"
  },
  textInput: {marginBottom: 20}
});

export default BudgetForm;
