import {renderHook, waitFor} from "@testing-library/react-native";

import useTrueLayerTransactionsFromAcct from "./useTrueLayerTransactions";

import {
  CARD_TRANSACTION_ALL_FIELDS,
  CARD_TRANSACTION_REQUIRED_FIELDS
} from "../../../tests/mocks/trueLayer/dataAPI/data/cardData";
import {ERROR_429_RESPONSE} from "../../../tests/mocks/trueLayer/dataAPI/data/serverResponseData";
import {tanstackQueryTestWrapper} from "../../../tests/mocks/utils";

describe("useTrueLayerTransactions", () => {
  test("returns a correct list of card transactions on a 200 status code", async () => {
    const {result} = renderHook(() => useTrueLayerTransactionsFromAcct("200"), {
      wrapper: tanstackQueryTestWrapper
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      CARD_TRANSACTION_ALL_FIELDS,
      CARD_TRANSACTION_REQUIRED_FIELDS
    ]);
    expect(result.current.error).toBeNull();
  });

  test("returns an error message on a 429 status code", async () => {
    const {result} = renderHook(() => useTrueLayerTransactionsFromAcct("429"), {
      wrapper: tanstackQueryTestWrapper
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(ERROR_429_RESPONSE);
  });
});
