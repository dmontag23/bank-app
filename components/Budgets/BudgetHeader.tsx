import React, {useState} from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {Avatar, IconButton} from "react-native-paper";

import BudgetDialog from "./BudgetDialog";
import BudgetMenu from "./BudgetMenu";

import useStoreBudget from "../../hooks/budgets/useStoreBudget";
import {Budget} from "../../types/budget";

type BudgetHeaderProps = {
  selectedBudget: Budget | null;
  setSelectedBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
};

const BudgetHeader = ({
  selectedBudget,
  setSelectedBudget
}: BudgetHeaderProps) => {
  const {mutate: storeBudget} = useStoreBudget();

  const [isBudgetDialogVisible, setIsBudgetDialogVisible] = useState(false);
  const showBudgetDialog = () => setIsBudgetDialogVisible(true);
  const hideBudgetDialog = () => setIsBudgetDialogVisible(false);

  const handleBudgetDialogSubmit = async (newBudget: Budget) => {
    await storeBudget(newBudget);
    setSelectedBudget(newBudget);
  };

  return (
    <>
      <BudgetDialog
        isVisible={isBudgetDialogVisible}
        hide={hideBudgetDialog}
        onSubmit={handleBudgetDialogSubmit}
      />
      <View style={styles.container}>
        <IconButton
          icon="plus"
          size={30}
          onPress={showBudgetDialog}
          testID="addBudgetButton"
        />
        <BudgetMenu
          renderMenuIcon={openMenu => (
            <TouchableOpacity
              accessibilityLabel="Budget menu"
              onPress={openMenu}>
              <Avatar.Text
                size={40}
                label={selectedBudget?.name.slice(0, 3) ?? ""}
              />
            </TouchableOpacity>
          )}
          setSelectedBudget={setSelectedBudget}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginRight: 20
  }
});

export default BudgetHeader;
