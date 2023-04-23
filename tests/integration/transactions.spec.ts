import AsyncStorage from "@react-native-async-storage/async-storage";
import {renderHook, waitFor} from "@testing-library/react-native";

import {trueLayerDataApi} from "../../axiosConfig";
import useTransactions from "../../hooks/transactions/useTransactions";
import {TransactionCategory} from "../../types/transaction";
import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../mocks/trueLayer/dataAPI/data/cardData";
import {TanstackQueryTestWrapper} from "../mocks/utils";

jest.mock("../../axiosConfig");

describe("transaction flow", () => {
  test("returns empty values when no truelayer transactions exist", async () => {
    // setup mocks
    const mockTrueLayerDataApi = trueLayerDataApi as jest.MockedObject<
      typeof trueLayerDataApi
    >;
    mockTrueLayerDataApi.get.mockImplementationOnce(async () => []);

    const {result} = renderHook(() => useTransactions("dummy"), {
      wrapper: TanstackQueryTestWrapper
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([]);
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  test("stores default category values", async () => {
    // setup mocks
    const mockTrueLayerDataApi = trueLayerDataApi as jest.MockedObject<
      typeof trueLayerDataApi
    >;
    mockTrueLayerDataApi.get.mockImplementationOnce(async () => [
      TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
    ]);

    const {result} = renderHook(() => useTransactions("dummy"), {
      wrapper: TanstackQueryTestWrapper
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([
      {
        id: "truelayer-a15d8156569ba848d84c07c34d291bca",
        name: "PAY OFF CREDIT CARD BILL",
        description: "Bills and Utilities",
        amount: 192.52,
        category: TransactionCategory.BILLS
      },
      {
        id: "truelayer-1234094-shocking-chipotle",
        name: "CHIPOTLE AIRPORT BLVD",
        description: "Food & Dining",
        amount: 36.71,
        category: TransactionCategory.EATING_OUT
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
    const mockTrueLayerDataApi = trueLayerDataApi as jest.MockedObject<
      typeof trueLayerDataApi
    >;
    mockTrueLayerDataApi.get.mockImplementationOnce(async () => [
      TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
    ]);

    // setup data in Async Storage
    await AsyncStorage.setItem(
      "truelayer-a15d8156569ba848d84c07c34d291bca",
      TransactionCategory.SAVINGS
    );

    const {result} = renderHook(() => useTransactions("dummy"), {
      wrapper: TanstackQueryTestWrapper
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([
      {
        id: "truelayer-a15d8156569ba848d84c07c34d291bca",
        name: "PAY OFF CREDIT CARD BILL",
        description: "Bills and Utilities",
        amount: 192.52,
        category: TransactionCategory.SAVINGS
      },
      {
        id: "truelayer-1234094-shocking-chipotle",
        name: "CHIPOTLE AIRPORT BLVD",
        description: "Food & Dining",
        amount: 36.71,
        category: TransactionCategory.EATING_OUT
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
});
