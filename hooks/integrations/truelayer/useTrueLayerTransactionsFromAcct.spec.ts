import {renderHook, waitFor} from "@testing-library/react-native";

import useTrueLayerTransactionsFromAcct from "./useTrueLayerTransactionsFromAcct";

import {trueLayerDataApi} from "../../../axiosConfig";
import {
  CARD_TRANSACTION_ALL_FIELDS,
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
} from "../../../tests/mocks/trueLayer/dataAPI/data/cardData";
import {ERROR_429_RESPONSE} from "../../../tests/mocks/trueLayer/dataAPI/data/serverResponseData";
import {tanstackQueryTestWrapper} from "../../../tests/mocks/utils";

jest.mock("../../../axiosConfig");

describe("useTrueLayerTransactions", () => {
  test("returns a correct list of card transactions on a 200 status code", async () => {
    const mockTrueLayerDataApi = trueLayerDataApi as jest.MockedObject<
      typeof trueLayerDataApi
    >;
    mockTrueLayerDataApi.get.mockImplementationOnce(async () => [
      CARD_TRANSACTION_ALL_FIELDS,
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
    ]);

    const {result} = renderHook(
      () => useTrueLayerTransactionsFromAcct("dummy"),
      {
        wrapper: tanstackQueryTestWrapper
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      CARD_TRANSACTION_ALL_FIELDS,
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
    ]);
    expect(result.current.error).toBeNull();
  });

  test("returns an error message on a 429 status code", async () => {
    const mockTrueLayerDataApi = trueLayerDataApi as jest.MockedObject<
      typeof trueLayerDataApi
    >;
    mockTrueLayerDataApi.get.mockImplementationOnce(async () =>
      Promise.reject(ERROR_429_RESPONSE)
    );

    const {result} = renderHook(
      () => useTrueLayerTransactionsFromAcct("dummy"),
      {
        wrapper: tanstackQueryTestWrapper
      }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(ERROR_429_RESPONSE);
  });
});
