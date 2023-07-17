import React, {useState} from "react";
import {StyleSheet, useWindowDimensions} from "react-native";
import {Button, Dialog, Portal, Text, useTheme} from "react-native-paper";
import "react-native-get-random-values";
import {v4 as uuid} from "uuid";

import BudgetForm from "./form/BudgetForm";

import {Budget, BudgetInput} from "../../types/budget";

const mapBudgetInputToBudget = (budgetInput: BudgetInput): Budget => ({
  ...budgetInput,
  items: budgetInput.items.map(item => ({...item, cap: Number(item.cap)}))
});

type BudgetDialogProps = {
  isVisible: boolean;
  hide: () => void;
  onSubmit: (budget: Budget) => Promise<void>;
};

const BudgetDialog = ({isVisible, hide, onSubmit}: BudgetDialogProps) => {
  const theme = useTheme();
  const {height: deviceHeight} = useWindowDimensions();

  const today = new Date();
  const defaultBudget: BudgetInput = {
    id: uuid(),
    name: "",
    window: {
      start: new Date(today.getFullYear(), today.getMonth(), 1), // first day of current month
      end: new Date(today.getFullYear(), today.getMonth() + 1, 0) // last day of current month
    },
    items: []
  };
  const [budget, setBudget] = useState(defaultBudget);

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
            New Budget
          </Text>
        </Dialog.Title>
        <Dialog.ScrollArea>
          <BudgetForm budget={budget} setBudget={setBudget} />
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button
            onPress={() => {
              hide();
              setBudget(defaultBudget);
            }}
            textColor={theme.colors.error}>
            Cancel
          </Button>
          <Button
            onPress={async () => {
              await onSubmit(mapBudgetInputToBudget(budget));
              hide();
              setBudget(defaultBudget);
            }}>
            Create
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
