import {renderHook, waitFor} from "@testing-library/react-native";

import {mapTrueLayerTransactionToInternalTransaction} from "./integrations/truelayer/trueLayerMappings";
import useTrueLayerTransactionsFromAcct from "./integrations/truelayer/useTrueLayerTransactionsFromAcct";
import useTransactions from "./useTransactions";

import {EATING_OUT_CARD_TRANSACTION} from "../tests/mocks/data/transactions";
import {TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS} from "../tests/mocks/trueLayer/dataAPI/data/cardData";

jest.mock("./integrations/truelayer/trueLayerMappings");
jest.mock("./integrations/truelayer/useTrueLayerTransactionsFromAcct");

describe("useTransactions", () => {
  test("returns the merged list of transactions when data is present", async () => {
    const mockUseTrueLayerTransactionsFromAcct =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useTrueLayerTransactionsFromAcct as jest.MockedFunction<any>;
    mockUseTrueLayerTransactionsFromAcct.mockImplementation(() => ({
      isLoading: false,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    }));
    const mockMapTrueLayerTransactionToInternalTransaction =
      mapTrueLayerTransactionToInternalTransaction as jest.MockedFunction<
        typeof mapTrueLayerTransactionToInternalTransaction
      >;
    mockMapTrueLayerTransactionToInternalTransaction.mockImplementation(
      () => EATING_OUT_CARD_TRANSACTION
    );

    const {result} = renderHook(() => useTransactions("dummy"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([EATING_OUT_CARD_TRANSACTION]);
    expect(useTrueLayerTransactionsFromAcct).toHaveBeenCalledTimes(1);
    expect(useTrueLayerTransactionsFromAcct).toHaveBeenCalledWith("dummy");
    expect(mapTrueLayerTransactionToInternalTransaction).toHaveBeenCalledTimes(
      1
    );
    expect(mapTrueLayerTransactionToInternalTransaction).toHaveBeenCalledWith(
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
    );
  });

  test("returns an empty list when data is undefined", async () => {
    const mockUseTrueLayerTransactionsFromAcct =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useTrueLayerTransactionsFromAcct as jest.MockedFunction<any>;
    mockUseTrueLayerTransactionsFromAcct.mockImplementation(() => ({
      isLoading: true,
      data: undefined
    }));
    const mockMapTrueLayerTransactionToInternalTransaction =
      mapTrueLayerTransactionToInternalTransaction as jest.MockedFunction<
        typeof mapTrueLayerTransactionToInternalTransaction
      >;
    mockMapTrueLayerTransactionToInternalTransaction.mockImplementation();

    const {result} = renderHook(() => useTransactions("dummy"));

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.transactions).toEqual([]);
    expect(useTrueLayerTransactionsFromAcct).toHaveBeenCalledTimes(1);
    expect(useTrueLayerTransactionsFromAcct).toHaveBeenCalledWith("dummy");
    expect(mapTrueLayerTransactionToInternalTransaction).not.toHaveBeenCalled();
  });
});
