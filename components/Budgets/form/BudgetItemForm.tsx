import React from "react";
import {Control, useFieldArray, useWatch} from "react-hook-form";
import {LayoutAnimation} from "react-native";
import {Button} from "react-native-paper";
import "react-native-get-random-values";
import {v4 as uuid} from "uuid";

import BudgetItemFormFields from "./BudgetItemFormFields";

import {BudgetInput, BudgetItemInput} from "../../../types/budget";
import {TransactionCategory} from "../../../types/transaction";
import ExpandableAccordion from "../../ui/ExpandableAccordion";

type BudgetItemFormProps = {
  control: Control<BudgetInput>;
};

const BudgetItemForm = ({control}: BudgetItemFormProps) => {
  const defaultBudgetItem: BudgetItemInput = {
    id: uuid(),
    name: "",
    cap: "",
    categories: []
  };

  const {fields, append} = useFieldArray({name: "items", control});
  const budgetItems = useWatch({name: "items", control});

  // TODO: Add functionality to remove budget item
  return (
    <>
      {fields.map((field, i) => (
        <ExpandableAccordion
          key={field.id}
          title={field.name || "Budget Item"}
          isInitiallyExpanded>
          <BudgetItemFormFields
            disabledCategories={budgetItems.reduce<TransactionCategory[]>(
              (accCategories, curBudgetItem) =>
                // note: have to use budgetItems[i].id instead of field.id here due
                // to how react-hook-form handles dynamic ids (it adds its own id
                // prop to manage the dynamic array)
                // see https://github.com/orgs/react-hook-form/discussions/8935
                budgetItems[i]?.id === curBudgetItem.id
                  ? accCategories
                  : [...accCategories, ...curBudgetItem.categories],
              []
            )}
            control={control}
            index={i}
          />
        </ExpandableAccordion>
      ))}
      <Button
        icon="plus"
        onPress={() => {
          append(defaultBudgetItem);
          LayoutAnimation.easeInEaseOut();
        }}>
        Add item
      </Button>
    </>
  );
};

export default BudgetItemForm;
