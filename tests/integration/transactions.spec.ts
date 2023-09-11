import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {trueLayerDataApi} from "../../api/axiosConfig";
import useTransactions from "../../hooks/transactions/useTransactions";
import {TransactionCategory} from "../../types/transaction";
import {CardTransaction} from "../../types/trueLayer/dataAPI/cards";
import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../mocks/trueLayer/dataAPI/data/cardTransactionData";

jest.mock("../../api/axiosConfig");

describe("useTransactions transaction flow", () => {
  test("returns empty values when no truelayer transactions exist", async () => {
    // setup mocks
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    ).mockImplementation(async () => []);

    const {result} = renderHook(() => useTransactions("dummy"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([]);
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  test("stores default category values", async () => {
    // setup mocks
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    )
      .mockResolvedValueOnce([
        TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
        TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
      ])
      .mockResolvedValueOnce([]);

    const {result} = renderHook(() => useTransactions("dummy"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([
      {
        id: "a15d8156569ba848d84c07c34d291bca",
        name: "PAY OFF CREDIT CARD BILL",
        description: "Bills and Utilities",
        amount: 192.52,
        category: TransactionCategory.BILLS,
        timestamp: new Date(
          TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.timestamp
        )
      },
      {
        id: "1234094-shocking-chipotle",
        name: "CHIPOTLE AIRPORT BLVD",
        description: "Food & Dining",
        amount: 36.71,
        category: TransactionCategory.EATING_OUT,
        timestamp: new Date(
          TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS.timestamp
        )
      }
    ]);
    expect(
      await AsyncStorage.multiGet([
        "truelayer-a15d8156569ba848d84c07c34d291bca",
        "truelayer-1234094-shocking-chipotle"
      ])
    ).toEqual([
      ["truelayer-a15d8156569ba848d84c07c34d291bca", TransactionCategory.BILLS],
      ["truelayer-1234094-shocking-chipotle", TransactionCategory.EATING_OUT]
    ]);
  });

  test("merges transaction categories from storage", async () => {
    // setup mocks
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    )
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
        TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
      ]);

    // setup data in Async Storage
    await AsyncStorage.setItem(
      "truelayer-a15d8156569ba848d84c07c34d291bca",
      TransactionCategory.SAVINGS
    );

    const {result} = renderHook(() => useTransactions("dummy"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([
      {
        id: "a15d8156569ba848d84c07c34d291bca",
        name: "PAY OFF CREDIT CARD BILL",
        description: "Bills and Utilities",
        amount: 192.52,
        category: TransactionCategory.SAVINGS,
        timestamp: new Date(
          TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.timestamp
        )
      },
      {
        id: "1234094-shocking-chipotle",
        name: "CHIPOTLE AIRPORT BLVD",
        description: "Food & Dining",
        amount: 36.71,
        category: TransactionCategory.EATING_OUT,
        timestamp: new Date(
          TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS.timestamp
        )
      }
    ]);
    expect(
      await AsyncStorage.multiGet([
        "truelayer-a15d8156569ba848d84c07c34d291bca",
        "truelayer-1234094-shocking-chipotle"
      ])
    ).toEqual([
      [
        "truelayer-a15d8156569ba848d84c07c34d291bca",
        TransactionCategory.SAVINGS
      ],
      ["truelayer-1234094-shocking-chipotle", TransactionCategory.EATING_OUT]
    ]);
  });

  test("merges transactions from separate api calls correctly", async () => {
    // setup mocks
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    )
      .mockResolvedValueOnce([
        TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
        TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
      ])
      .mockResolvedValueOnce([
        TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS
      ]);

    // setup data in Async Storage
    await AsyncStorage.setItem(
      "truelayer-a15d8156569ba848d84c07c34d291bca",
      TransactionCategory.SAVINGS
    );

    const {result} = renderHook(() => useTransactions("dummy"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([
      {
        id: "a15d8156569ba848d84c07c34d291bca",
        name: "PAY OFF CREDIT CARD BILL",
        description: "Bills and Utilities",
        amount: 192.52,
        category: TransactionCategory.SAVINGS,
        timestamp: new Date(
          TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.timestamp
        )
      },
      {
        id: "1234094-shocking-chipotle",
        name: "CHIPOTLE AIRPORT BLVD",
        description: "Food & Dining",
        amount: 36.71,
        category: TransactionCategory.EATING_OUT,
        timestamp: new Date(
          TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS.timestamp
        )
      },
      {
        id: "1234000-chai-pot",
        name: "CHAI POT YUM",
        description: "Food & Dining",
        amount: 3.3,
        category: TransactionCategory.EATING_OUT,
        timestamp: new Date(
          TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.timestamp
        )
      }
    ]);
    expect(
      await AsyncStorage.multiGet([
        "truelayer-a15d8156569ba848d84c07c34d291bca",
        "truelayer-1234094-shocking-chipotle",
        "truelayer-1234000-chai-pot"
      ])
    ).toEqual([
      [
        "truelayer-a15d8156569ba848d84c07c34d291bca",
        TransactionCategory.SAVINGS
      ],
      ["truelayer-1234094-shocking-chipotle", TransactionCategory.EATING_OUT],
      ["truelayer-1234000-chai-pot", TransactionCategory.EATING_OUT]
    ]);
  });
});
