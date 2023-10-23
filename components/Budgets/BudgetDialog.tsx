import React, {useEffect, useMemo} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {StyleSheet, useWindowDimensions} from "react-native";
import {Button, Dialog, Portal, Text, useTheme} from "react-native-paper";
import "react-native-get-random-values";
import {v4 as uuid} from "uuid";

import BudgetForm from "./form/BudgetForm";

import useStoreBudget from "../../hooks/budgets/useStoreBudget";
import {Budget, BudgetInput} from "../../types/budget";

const mapBudgetInputToBudget = (budgetInput: BudgetInput): Budget => ({
  ...budgetInput,
  items: budgetInput.items.map(item => ({...item, cap: Number(item.cap)}))
});

const mapBudgetToBudgetInput = (budget: Budget): BudgetInput => ({
  ...budget,
  items: budget.items.map(item => ({...item, cap: item.cap.toString()}))
});

type BudgetDialogProps = {
  isVisible: boolean;
  hide: () => void;
  setSelectedBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
  isEditing?: boolean;
  formValues?: Budget;
};

const BudgetDialog = ({
  isVisible,
  hide,
  setSelectedBudget,
  isEditing = false,
  formValues
}: BudgetDialogProps) => {
  const theme = useTheme();
  const {height: deviceHeight} = useWindowDimensions();
  const {mutate: storeBudget} = useStoreBudget();

  const defaultBudget: BudgetInput = useMemo(
    () => ({
      id: uuid(),
      name: "",
      window: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // first day of current month
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) // last day of current month
      },
      items: []
    }),
    []
  );

  /* TODO: Note there is currently an issue where onChangeText fires whenever
  the field is blurred, even if the text in the field has not changed. This means
  that any un-focused fields (e.g. "name") might not be reset correctly.
  
  This seems to be a react native issue as it also happens with a regular 
  RN TextBox component. It could be peripherally related to 
  https://github.com/facebook/react-native/issues/36494 but I should verify if 
  this is actually an issue and I might need to raise a bug for it. */

  const useFormOptions = {
    defaultValues: defaultBudget,
    ...(formValues ? {values: mapBudgetToBudgetInput(formValues)} : {})
  };
  const {
    control,
    handleSubmit,
    formState: {isSubmitSuccessful},
    reset
  } = useForm<BudgetInput>(useFormOptions);

  useEffect(() => {
    // the default budget needs to be passed in here in order to
    // get a new unique uuid for the next budget
    const resetValues = formValues
      ? mapBudgetToBudgetInput(formValues)
      : {...defaultBudget, id: uuid()};
    if (isSubmitSuccessful) reset(resetValues);
  }, [formValues, isSubmitSuccessful, reset, defaultBudget]);

  const onBudgetDialogSubmit: SubmitHandler<
    BudgetInput
  > = async submittedBudgetInput => {
    const budget = mapBudgetInputToBudget(submittedBudgetInput);
    await storeBudget(budget);
    setSelectedBudget(budget);
  };

  return (
    <Portal>
      <Dialog
        dismissable={false}
        visible={isVisible}
        onDismiss={hide}
        // TODO: It seems the react paper dialog does not respect the
        // safe area view out of the box, which is somewhat expected since the portal
        // renders outside the safe area view. This is a workaround that is okay,
        // but it would be nice to do something more elegant in the future.
        style={{maxHeight: 0.85 * deviceHeight}}>
        <Dialog.Title>
          {/* TODO: Add proper styling here, e.g. remove lines from
          the box with the categories and spaces between the title text*/}
          <Text variant="titleLarge" style={styles.text}>
            {isEditing ? "Edit Budget" : "New Budget"}
          </Text>
        </Dialog.Title>
        <Dialog.ScrollArea>
          <BudgetForm control={control} />
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button
            onPress={() => {
              hide();
              reset();
            }}
            textColor={theme.colors.error}>
            Cancel
          </Button>
          <Button
            onPress={async () => {
              hide();
              handleSubmit(onBudgetDialogSubmit)();
            }}>
            {isEditing ? "Save" : "Create"}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  text: {textAlign: "center"}
});

export default BudgetDialog;
