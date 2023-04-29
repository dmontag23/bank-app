import React from "react";
import {LayoutAnimation} from "react-native";
import {Button} from "react-native-paper";
import "react-native-get-random-values";
import {v4 as uuid} from "uuid";

import BudgetItemFormFields from "./BudgetItemFormFields";

import {BudgetInput, BudgetItemInput} from "../../../types/budget";
import {TransactionCategory} from "../../../types/transaction";
import ExpandableAccordion from "../../ui/ExpandableAccordion";

type BudgetItemFormProps = {
  budget: BudgetInput;
  setBudget: React.Dispatch<React.SetStateAction<BudgetInput>>;
};

const BudgetItemForm = ({budget, setBudget}: BudgetItemFormProps) => {
  const defaultBudgetItem: BudgetItemInput = {
    id: uuid(),
    name: "",
    cap: "",
    categories: []
  };

  const addBudgetItemToForm = () => {
    setBudget(prevBudgetFormValues => ({
      ...prevBudgetFormValues,
      items: [...prevBudgetFormValues.items, defaultBudgetItem]
    }));
  };

  const createSetBudgetItem =
    (budgetItemIndex: number) => (newBudgetItem: BudgetItemInput) =>
      setBudget(prevBudgetFormValues => ({
        ...prevBudgetFormValues,
        items: [
          ...prevBudgetFormValues.items.slice(0, budgetItemIndex),
          newBudgetItem,
          ...prevBudgetFormValues.items.slice(budgetItemIndex + 1)
        ]
      }));

  // TODO: Add functionality to remove budget item
  return (
    <>
      {budget.items.map((item, i) => (
        <ExpandableAccordion key={i} title={item.name || "Budget Item"}>
          <BudgetItemFormFields
            budgetItem={item}
            disabledCategories={budget.items
              .reduce<TransactionCategory[]>(
                (accCategories, curBudgetItem) =>
                  item.id === curBudgetItem.id
                    ? accCategories
                    : [...accCategories, ...curBudgetItem.categories],
                []
              )
              .flat()}
            setBudgetItem={createSetBudgetItem(i)}
          />
        </ExpandableAccordion>
      ))}
      <Button
        icon="plus"
        onPress={() => {
          addBudgetItemToForm();
          LayoutAnimation.easeInEaseOut();
        }}>
        Add item
      </Button>
    </>
  );
};

export default BudgetItemForm;
