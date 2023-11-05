import React from "react";
import {Control, Controller} from "react-hook-form";
import {StyleSheet, View} from "react-native";
import {Checkbox, Text, TextInput} from "react-native-paper";

import useGetCategoryMap from "../../../hooks/transactions/useGetCategoryMap";
import {BudgetInput} from "../../../types/budget";
import LoadingSpinner from "../../ui/LoadingSpinner";

type BudgetItemFormFieldsProps = {
  disabledCategories: string[];
  control: Control<BudgetInput>;
  index: number;
};

const BudgetItemFormFields = ({
  disabledCategories,
  control,
  index
}: BudgetItemFormFieldsProps) => {
  const {isLoading: isCategoryMapLoading, data: categoryMap} =
    useGetCategoryMap();
  return (
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
      <View testID="categoryList">
        <Text variant="bodyLarge">Select categories</Text>
        {isCategoryMapLoading ? (
          <LoadingSpinner />
        ) : (
          Object.keys(categoryMap ?? {}).map((category, i) => (
            <Controller
              key={i}
              control={control}
              render={({field: {onChange, value}}) => (
                <Checkbox.Item
                  key={i}
                  disabled={disabledCategories.includes(category)}
                  label={category}
                  labelVariant="bodyMedium"
                  onPress={() =>
                    onChange(
                      value.includes(category)
                        ? value.filter(curCategory => curCategory !== category)
                        : [...value, category]
                    )
                  }
                  status={value.includes(category) ? "checked" : "unchecked"}
                  style={styles.checkbox}
                />
              )}
              name={`items.${index}.categories`}
            />
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // the code below aligns the text in the checkbox items more to the left
  // https://stackoverflow.com/questions/60201837/is-there-a-way-to-remove-default-padding-from-react-native-picker-component
  checkbox: {marginLeft: -10},
  container: {rowGap: 20}
});

export default BudgetItemFormFields;
