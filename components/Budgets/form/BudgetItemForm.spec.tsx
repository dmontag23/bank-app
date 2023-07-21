import React from "react";
import {View} from "react-native";
import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {fireEvent, render, screen} from "@testing-library/react-native";

import BudgetItemForm from "./BudgetItemForm";
import BudgetItemFormFields from "./BudgetItemFormFields";

import {ComponentTestWrapper} from "../../../tests/mocks/utils";
import {BudgetInput, BudgetItemInput} from "../../../types/budget";
import {TransactionCategory} from "../../../types/transaction";
import ExpandableAccordion from "../../ui/ExpandableAccordion";

jest.mock("uuid", () => ({
  v4: () => "unique-id"
}));
jest.mock("./BudgetItemFormFields");
jest.mock("../../ui/ExpandableAccordion");

describe("BudgetItemForm component", () => {
  const MOCK_ACCORDION = jest.fn<typeof ExpandableAccordion>();
  const MOCK_BUDGET_ITEM_FORM_FIELDS = jest.fn();
  const EMPTY_BUDGET: BudgetInput = {
    id: "1",
    name: "",
    window: {
      start: new Date("2023-01-01"),
      end: new Date("2023-01-31")
    },
    items: [
      {
        id: "",
        name: "",
        categories: [],
        cap: ""
      }
    ]
  };

  const ITEM_1: BudgetItemInput = {
    id: "item-1",
    name: "Item 1",
    categories: [TransactionCategory.EATING_OUT],
    cap: ""
  };

  beforeEach(() => {
    (
      ExpandableAccordion as jest.MockedFunction<typeof ExpandableAccordion>
    ).mockImplementation(props => {
      MOCK_ACCORDION(props);
      return <View testID={`accordion-${props.title}`} />;
    });
    (
      BudgetItemFormFields as jest.MockedFunction<typeof BudgetItemFormFields>
    ).mockImplementation(props => {
      MOCK_BUDGET_ITEM_FORM_FIELDS(props);
      return <View testID={`budgetItemFormFields-${props.budgetItem.id}`} />;
    });
  });

  test("renders all components", async () => {
    render(<BudgetItemForm budget={EMPTY_BUDGET} setBudget={() => {}} />, {
      wrapper: ComponentTestWrapper
    });

    expect(screen.getByTestId("accordion-Budget Item")).toBeVisible();
    expect(screen.getByText("Add item")).toBeVisible();
  });

  test("has the correct accordion text when no item name is provided", async () => {
    render(<BudgetItemForm budget={EMPTY_BUDGET} setBudget={() => {}} />, {
      wrapper: ComponentTestWrapper
    });

    expect(screen.getByTestId("accordion-Budget Item")).toBeVisible();
    expect(MOCK_ACCORDION).toBeCalledTimes(1);
    expect(MOCK_ACCORDION).toBeCalledWith(
      expect.objectContaining({
        title: "Budget Item"
      })
    );
  });

  test("has the correct accordion text when an item name is provided", async () => {
    render(
      <BudgetItemForm
        budget={{...EMPTY_BUDGET, items: [ITEM_1]}}
        setBudget={() => {}}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(screen.getByTestId("accordion-Item 1")).toBeVisible();
    expect(MOCK_ACCORDION).toBeCalledTimes(1);
    expect(MOCK_ACCORDION).toBeCalledWith(
      expect.objectContaining({
        title: "Item 1"
      })
    );
  });

  test("BudgetItemFormFields is called correctly", async () => {
    const item2: BudgetItemInput = {
      id: "item-2",
      name: "Item 2",
      cap: "",
      categories: [TransactionCategory.SAVINGS]
    };
    const item3: BudgetItemInput = {
      id: "item-3",
      name: "Item 3",
      cap: "",
      categories: [TransactionCategory.BILLS]
    };

    const budget: BudgetInput = {
      ...EMPTY_BUDGET,
      items: [ITEM_1, item2, item3]
    };
    const setBudget =
      jest.fn<React.Dispatch<React.SetStateAction<BudgetInput>>>();

    render(<BudgetItemForm budget={budget} setBudget={setBudget} />, {
      wrapper: ComponentTestWrapper
    });

    expect(screen.getByTestId("accordion-Item 1")).toBeVisible();
    expect(screen.getByTestId("accordion-Item 2")).toBeVisible();
    expect(screen.getByTestId("accordion-Item 3")).toBeVisible();
    expect(MOCK_ACCORDION).toBeCalledTimes(3);

    // test BudgetItemFormFields
    const BudgetItemFormFieldsComponent = MOCK_ACCORDION.mock.calls[1][0]
      .children as JSX.Element;
    render(BudgetItemFormFieldsComponent, {
      wrapper: ComponentTestWrapper
    });

    expect(screen.getByTestId("budgetItemFormFields-item-2")).toBeVisible();
    expect(MOCK_BUDGET_ITEM_FORM_FIELDS).toBeCalledTimes(1);
    expect(MOCK_BUDGET_ITEM_FORM_FIELDS).toBeCalledWith({
      budgetItem: item2,
      disabledCategories: [
        TransactionCategory.EATING_OUT,
        TransactionCategory.BILLS
      ],
      setBudgetItem: expect.any(Function)
    });

    // test setBudgetItem updates the right item
    // in this case the second item
    const setBudgetItem = BudgetItemFormFieldsComponent.props.setBudgetItem;
    const newBudgetItem: BudgetItemInput = {
      ...item2,
      categories: [TransactionCategory.ENTERTAINMENT]
    };
    setBudgetItem(newBudgetItem);
    expect(setBudget).toBeCalledTimes(1);

    // test state change to set new budget from previous form values
    const newBudgetFn = setBudget.mock.calls[0][0] as (
      prevValues: BudgetInput
    ) => BudgetInput;
    const newBudget = newBudgetFn(budget);
    expect(newBudget).toEqual({
      ...EMPTY_BUDGET,
      items: [ITEM_1, newBudgetItem, item3]
    });
  });

  test("correctly adds an item to the form", async () => {
    const setBudget =
      jest.fn<React.Dispatch<React.SetStateAction<BudgetInput>>>();

    render(<BudgetItemForm budget={EMPTY_BUDGET} setBudget={setBudget} />, {
      wrapper: ComponentTestWrapper
    });

    fireEvent.press(screen.getByText("Add item"));
    expect(setBudget).toBeCalledTimes(1);
    const newBudgetFn = setBudget.mock.calls[0][0] as (
      prevValues: BudgetInput
    ) => BudgetInput;
    const newBudget = newBudgetFn(EMPTY_BUDGET);
    expect(newBudget).toEqual({
      ...EMPTY_BUDGET,
      items: [
        ...EMPTY_BUDGET.items,
        {
          id: "unique-id",
          name: "",
          cap: "",
          categories: []
        }
      ]
    });
  });
});
