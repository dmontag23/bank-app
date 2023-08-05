import React from "react";
import {Control, Controller} from "react-hook-form";
import {StyleSheet, View} from "react-native";
import {Checkbox, Text, TextInput} from "react-native-paper";

import {BudgetInput} from "../../../types/budget";
import {TransactionCategory} from "../../../types/transaction";

type BudgetItemFormFieldsProps = {
  disabledCategories: TransactionCategory[];
  control: Control<BudgetInput>;
  index: number;
};

const BudgetItemFormFields = ({
  disabledCategories,
  control,
  index
}: BudgetItemFormFieldsProps) => (
  <View style={styles.container}>
    <Controller
      control={control}
      render={({field: {onChange, onBlur, value}}) => (
        <TextInput
          label="Item name"
          accessibilityLabel="Item name"
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          testID="budgetItemNameInput"
        />
      )}
      name={`items.${index}.name`}
    />
    <Controller
      control={control}
      render={({field: {onChange, onBlur, value}}) => (
        <TextInput
          label="Cap"
          accessibilityLabel="Cap"
          keyboardType="numeric"
          // TODO: Use dynamic currency here!
          left={<TextInput.Affix text="£ " />}
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          testID="budgetItemCapInput"
        />
      )}
      name={`items.${index}.cap`}
    />
    <View>
      <Text variant="bodyLarge">Select categories</Text>
      {(
        Object.keys(TransactionCategory) as Array<
          keyof typeof TransactionCategory
        >
      ).map((category, i) => {
        const categoryValue = TransactionCategory[category];

        return (
          <Controller
            key={i}
            control={control}
            render={({field: {onChange, value}}) => (
              <Checkbox.Item
                key={i}
                disabled={disabledCategories.includes(categoryValue)}
                label={category}
                labelVariant="bodyMedium"
                onPress={() =>
                  onChange(
                    value.includes(categoryValue)
                      ? value.filter(
                          curCategory => curCategory !== categoryValue
                        )
                      : [...value, categoryValue]
                  )
                }
                status={value.includes(categoryValue) ? "checked" : "unchecked"}
                style={styles.checkbox}
              />
            )}
            name={`items.${index}.categories`}
          />
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  // the code below aligns the text in the checkbox items more to the left
  // https://stackoverflow.com/questions/60201837/is-there-a-way-to-remove-default-padding-from-react-native-picker-component
  checkbox: {marginLeft: -10},
  container: {rowGap: 20}
});

export default BudgetItemFormFields;
