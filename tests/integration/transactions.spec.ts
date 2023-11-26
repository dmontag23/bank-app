import nock from "nock";
import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import config from "../../config.json";
import useGetAllMappedTruelayerTransactions from "../../hooks/integrations/truelayer/useGetAllMappedTruelayerTransactions";
import {TRUELAYER_MASTERCARD} from "../../mock-server/truelayer/data/cardData";
import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../../mock-server/truelayer/data/cardTransactionData";
import {Source} from "../../types/transaction";

describe("useTransactions transaction flow", () => {
  test("returns empty values when no truelayer cards exist", async () => {
    // setup mocks
    nock(config.integrations.trueLayer.sandboxDataUrl)
      .get("/v1/cards")
      .reply(200, {
        results: [],
        status: "Succeeded"
      });

    const {result} = renderHook(() => useGetAllMappedTruelayerTransactions());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([]);
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  test("returns empty values when no truelayer transactions exist", async () => {
    // setup mocks
    nock(config.integrations.trueLayer.sandboxDataUrl)
      .get("/v1/cards")
      .reply(200, {
        results: [TRUELAYER_MASTERCARD],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
      .reply(200, {
        results: [],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions/pending"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions\/pending/)
      .reply(200, {
        results: [],
        status: "Succeeded"
      });

    const {result} = renderHook(() => useGetAllMappedTruelayerTransactions());
    await waitFor(() => expect(result.current.isLoading).toBe(false), {
      timeout: 2000
    });
    expect(result.current.transactions).toEqual([]);
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  test("stores default category values", async () => {
    // setup mocks
    nock(config.integrations.trueLayer.sandboxDataUrl)
      .get("/v1/cards")
      .reply(200, {
        results: [TRUELAYER_MASTERCARD],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
      .reply(200, {
        results: [
          TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
          TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
        ],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions/pending"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions\/pending/)
      .reply(200, {
        results: [],
        status: "Succeeded"
      });

    const {result} = renderHook(() => useGetAllMappedTruelayerTransactions());
    await waitFor(() => expect(result.current.isLoading).toBe(false), {
      timeout: 2000
    });
    expect(result.current.transactions).toEqual([
      {
        id: "a15d8156569ba848d84c07c34d291bca",
        name: "PAY OFF CREDIT CARD BILL",
        description: "Bills and Utilities",
        amount: 192.52,
        category: "Bills",
        timestamp: new Date(
          TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.timestamp
        ),
        source: Source.TRUELAYER
      },
      {
        id: "1234094-shocking-chipotle",
        name: "CHIPOTLE AIRPORT BLVD",
        description: "Food & Dining",
        amount: 36.71,
        category: "Eating out",
        timestamp: new Date(
          TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS.timestamp
        ),
        source: Source.TRUELAYER
      }
    ]);
    expect(
      await AsyncStorage.multiGet([
        "truelayer-a15d8156569ba848d84c07c34d291bca",
        "truelayer-1234094-shocking-chipotle"
      ])
    ).toEqual([
      ["truelayer-a15d8156569ba848d84c07c34d291bca", "Bills"],
      ["truelayer-1234094-shocking-chipotle", "Eating out"]
    ]);
  });

  test("merges transaction categories from storage", async () => {
    // setup mocks
    nock(config.integrations.trueLayer.sandboxDataUrl)
      .get("/v1/cards")
      .reply(200, {
        results: [TRUELAYER_MASTERCARD],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
      .reply(200, {
        results: [],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions/pending"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions\/pending/)
      .reply(200, {
        results: [
          TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
          TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
        ],
        status: "Succeeded"
      });

    // setup data in Async Storage
    await AsyncStorage.setItem(
      "truelayer-a15d8156569ba848d84c07c34d291bca",
      "Savings"
    );

    const {result} = renderHook(() => useGetAllMappedTruelayerTransactions());
    await waitFor(() => expect(result.current.isLoading).toBe(false), {
      timeout: 2000
    });
    expect(result.current.transactions).toEqual([
      {
        id: "a15d8156569ba848d84c07c34d291bca",
        name: "PAY OFF CREDIT CARD BILL",
        description: "Bills and Utilities",
        amount: 192.52,
        category: "Savings",
        timestamp: new Date(
          TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.timestamp
        ),
        source: Source.TRUELAYER
      },
      {
        id: "1234094-shocking-chipotle",
        name: "CHIPOTLE AIRPORT BLVD",
        description: "Food & Dining",
        amount: 36.71,
        category: "Eating out",
        timestamp: new Date(
          TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS.timestamp
        ),
        source: Source.TRUELAYER
      }
    ]);
    expect(
      await AsyncStorage.multiGet([
        "truelayer-a15d8156569ba848d84c07c34d291bca",
        "truelayer-1234094-shocking-chipotle"
      ])
    ).toEqual([
      ["truelayer-a15d8156569ba848d84c07c34d291bca", "Savings"],
      ["truelayer-1234094-shocking-chipotle", "Eating out"]
    ]);
  });

  test("merges transactions from separate api calls correctly", async () => {
    // setup mocks

    nock(config.integrations.trueLayer.sandboxDataUrl)
      .get("/v1/cards")
      .reply(200, {
        results: [TRUELAYER_MASTERCARD],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
      .reply(200, {
        results: [
          TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
          TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
        ],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions/pending"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions\/pending/)
      .reply(200, {
        results: [TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS],
        status: "Succeeded"
      });

    // setup data in Async Storage
    await AsyncStorage.setItem(
      "truelayer-a15d8156569ba848d84c07c34d291bca",
      "Savings"
    );

    const {result} = renderHook(() => useGetAllMappedTruelayerTransactions());
    await waitFor(() => expect(result.current.isLoading).toBe(false), {
      timeout: 2000
    });
    expect(result.current.transactions).toEqual([
      {
        id: "1234000-chai-pot",
        name: "CHAI POT YUM",
        description: "Food & Dining",
        amount: 3.3,
        category: "Eating out",
        timestamp: new Date(
          TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.timestamp
        ),
        source: Source.TRUELAYER
      },
      {
        id: "a15d8156569ba848d84c07c34d291bca",
        name: "PAY OFF CREDIT CARD BILL",
        description: "Bills and Utilities",
        amount: 192.52,
        category: "Savings",
        timestamp: new Date(
          TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.timestamp
        ),
        source: Source.TRUELAYER
      },
      {
        id: "1234094-shocking-chipotle",
        name: "CHIPOTLE AIRPORT BLVD",
        description: "Food & Dining",
        amount: 36.71,
        category: "Eating out",
        timestamp: new Date(
          TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS.timestamp
        ),
        source: Source.TRUELAYER
      }
    ]);
    expect(
      await AsyncStorage.multiGet([
        "truelayer-a15d8156569ba848d84c07c34d291bca",
        "truelayer-1234094-shocking-chipotle",
        "truelayer-1234000-chai-pot"
      ])
    ).toEqual([
      ["truelayer-a15d8156569ba848d84c07c34d291bca", "Savings"],
      ["truelayer-1234094-shocking-chipotle", "Eating out"],
      ["truelayer-1234000-chai-pot", "Eating out"]
    ]);
  });
});
