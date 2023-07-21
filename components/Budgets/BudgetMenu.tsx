import React, {useState} from "react";
import {GestureResponderEvent, StyleSheet, View} from "react-native";
import {IconButton, Menu, useTheme} from "react-native-paper";

import useDeleteBudget from "../../hooks/budgets/useDeleteBudget";
import useGetAllBudgets from "../../hooks/budgets/useGetAllBudgets";
import {Budget} from "../../types/budget";

type BudgetMenuProps = {
  renderMenuIcon: (
    openMenu: (e?: GestureResponderEvent) => void
  ) => JSX.Element;
  setSelectedBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
};

const BudgetMenu = ({renderMenuIcon, setSelectedBudget}: BudgetMenuProps) => {
  const theme = useTheme();

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const openMenu = () => setIsMenuVisible(true);
  const closeMenu = () => setIsMenuVisible(false);

  const {data: budgets} = useGetAllBudgets();
  const {mutate: deleteBudget} = useDeleteBudget();

  const menuIcon = renderMenuIcon(openMenu);

  // TODO: Should probably return a loading spinner as a menu
  // item if the budgets are still loading
  return budgets?.length ? (
    <Menu
      visible={isMenuVisible}
      onDismiss={closeMenu}
      anchor={menuIcon}
      anchorPosition="bottom">
      {budgets.map(budget => (
        <View key={budget.id} style={styles.menuItemContainer}>
          <Menu.Item
            onPress={() => {
              setSelectedBudget(budget);
              closeMenu();
            }}
            title={budget.name}
          />
          <IconButton
            icon="trash-can"
            iconColor={theme.colors.error}
            onPress={() => {
              setSelectedBudget(selectedBudget =>
                selectedBudget?.id === budget.id ? null : selectedBudget
              );
              deleteBudget(budget.id);
            }}
          />
        </View>
      ))}
    </Menu>
  ) : (
    <></>
  );
};

const styles = StyleSheet.create({
  menuItemContainer: {flexDirection: "row", justifyContent: "space-between"}
});

export default BudgetMenu;
