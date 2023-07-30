import React from "react";
import {StyleSheet, View} from "react-native";
import {Checkbox, Text, TextInput} from "react-native-paper";

import {BudgetItemInput} from "../../../types/budget";
import {TransactionCategory} from "../../../types/transaction";

type BudgetItemFormFieldsProps = {
  budgetItem: BudgetItemInput;
  disabledCategories: TransactionCategory[];
  setBudgetItem: (budgetItem: BudgetItemInput) => void;
};

const BudgetItemFormFields = ({
  budgetItem,
  disabledCategories,
  setBudgetItem
}: BudgetItemFormFieldsProps) => (
  <View style={styles.container}>
    <TextInput
      label="Item name"
      accessibilityLabel="Item name"
      value={budgetItem.name}
      onChangeText={name => setBudgetItem({...budgetItem, name})}
      testID="budgetItemNameInput"
    />
    <TextInput
      label="Cap"
      accessibilityLabel="Cap"
      keyboardType="numeric"
      value={budgetItem.cap}
      left={<TextInput.Affix text="£ " />}
      onChangeText={cap =>
        setBudgetItem({
          ...budgetItem,
          cap
        })
      }
      testID="budgetItemCapInput"
    />
    <View>
      <Text variant="bodyLarge">Select categories</Text>
      {(
        Object.keys(TransactionCategory) as Array<
          keyof typeof TransactionCategory
        >
      ).map((category, i) => {
        const transactionCategoryValue = TransactionCategory[category];
        const checked = budgetItem.categories.includes(
          transactionCategoryValue
        );

        return (
          <Checkbox.Item
            key={i}
            disabled={disabledCategories.includes(transactionCategoryValue)}
            label={category}
            labelVariant="bodyMedium"
            onPress={() =>
              setBudgetItem({
                ...budgetItem,
                categories: checked
                  ? budgetItem.categories.filter(
                      curCategory => curCategory !== transactionCategoryValue
                    )
                  : [...budgetItem.categories, transactionCategoryValue]
              })
            }
            status={checked ? "checked" : "unchecked"}
            style={styles.checkbox}
          />
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  // align the text in the checkbox items more to the left
  // https://stackoverflow.com/questions/60201837/is-there-a-way-to-remove-default-padding-from-react-native-picker-component
  checkbox: {marginLeft: -10},
  container: {rowGap: 20}
});

export default BudgetItemFormFields;
