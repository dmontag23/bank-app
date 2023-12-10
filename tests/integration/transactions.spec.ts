import nock from "nock";
import {act, renderHook, waitFor} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import config from "../../config.json";
import useGetAllMappedStarlingTransactions from "../../hooks/integrations/starling/useGetAllMappedStarlingTransactions";
import useGetAllMappedTruelayerTransactions from "../../hooks/integrations/truelayer/useGetAllMappedTruelayerTransactions";
import useGetTransactions from "../../hooks/transactions/useGetTransactions";
import {STARLING_ACCOUNT_1} from "../../mock-server/starling/data/accountData";
import {
  STARLING_FEED_ITEM_1,
  STARLING_FEED_ITEM_2
} from "../../mock-server/starling/data/feedData";
import {TRUELAYER_MASTERCARD} from "../../mock-server/truelayer/data/cardData";
import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../../mock-server/truelayer/data/cardTransactionData";
import {Category, Source} from "../../types/transaction";

describe("transaction flow", () => {
  describe("useGetAllMappedStarlingTransactions", () => {
    test("returns empty values when no accounts exist", async () => {
      // setup mocks
      nock(config.integrations.starling.sandboxUrl)
        .get("/v2/accounts")
        .reply(200, {accounts: []});

      const {result} = renderHook(() => useGetAllMappedStarlingTransactions());
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.transactions).toEqual([]);
      expect(await AsyncStorage.getAllKeys()).toEqual([]);
    });

    test("returns empty values when no starling transactions exist", async () => {
      // setup mocks
      nock(config.integrations.starling.sandboxUrl)
        .get("/v2/accounts")
        .reply(200, {accounts: [STARLING_ACCOUNT_1]})
        // matches any url of the form "v2/feed/account/<uuid>/category/<uuid>/transactions-between"
        .get(
          /\/v2\/feed\/account\/([0-9a-z-]+)\/category\/([0-9a-z-]+)\/transactions-between/
        )
        .reply(200, {feedItems: []});

      const {result} = renderHook(() => useGetAllMappedStarlingTransactions());
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 2000
      });
      expect(result.current.transactions).toEqual([]);
      expect(await AsyncStorage.getAllKeys()).toEqual([]);
    });

    test("uses default category values - no categories are put in storage", async () => {
      // setup mocks
      nock(config.integrations.starling.sandboxUrl)
        .get("/v2/accounts")
        .reply(200, {accounts: [STARLING_ACCOUNT_1]})
        // matches any url of the form "v2/feed/account/<uuid>/category/<uuid>/transactions-between"
        .get(
          /\/v2\/feed\/account\/([0-9a-z-]+)\/category\/([0-9a-z-]+)\/transactions-between/
        )
        .reply(200, {feedItems: [STARLING_FEED_ITEM_1]});

      const {result} = renderHook(() => useGetAllMappedStarlingTransactions());
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 2000
      });
      expect(result.current.transactions).toEqual([
        {
          id: STARLING_FEED_ITEM_1.feedItemUid,
          name: STARLING_FEED_ITEM_1.counterPartyName,
          description: STARLING_FEED_ITEM_1.spendingCategory,
          amount: STARLING_FEED_ITEM_1.amount.minorUnits / 100,
          category: Category.TRANSPORT,
          timestamp: new Date(STARLING_FEED_ITEM_1.transactionTime),
          source: Source.STARLING
        }
      ]);
      expect(await AsyncStorage.getAllKeys()).toEqual([]);
    });

    test("merges transaction categories from storage", async () => {
      // setup mocks
      nock(config.integrations.starling.sandboxUrl)
        .get("/v2/accounts")
        .reply(200, {accounts: [STARLING_ACCOUNT_1]})
        // matches any url of the form "v2/feed/account/<uuid>/category/<uuid>/transactions-between"
        .get(
          /\/v2\/feed\/account\/([0-9a-z-]+)\/category\/([0-9a-z-]+)\/transactions-between/
        )
        .reply(200, {feedItems: [STARLING_FEED_ITEM_1, STARLING_FEED_ITEM_2]});

      // setup data in Async Storage
      await AsyncStorage.setItem(
        `Starling-${STARLING_FEED_ITEM_1.feedItemUid}`,
        Category.SAVINGS
      );

      const {result} = renderHook(() => useGetAllMappedStarlingTransactions());
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 2000
      });
      expect(result.current.transactions).toEqual([
        {
          id: STARLING_FEED_ITEM_1.feedItemUid,
          name: STARLING_FEED_ITEM_1.counterPartyName,
          description: STARLING_FEED_ITEM_1.spendingCategory,
          amount: STARLING_FEED_ITEM_1.amount.minorUnits / 100,
          category: Category.SAVINGS,
          timestamp: new Date(STARLING_FEED_ITEM_1.transactionTime),
          source: Source.STARLING
        },
        {
          id: STARLING_FEED_ITEM_2.feedItemUid,
          name: STARLING_FEED_ITEM_2.counterPartyName,
          description: STARLING_FEED_ITEM_2.spendingCategory,
          amount: STARLING_FEED_ITEM_2.amount.minorUnits / 100,
          category: Category.BILLS,
          timestamp: new Date(STARLING_FEED_ITEM_2.transactionTime),
          source: Source.STARLING
        }
      ]);
      expect(
        await AsyncStorage.multiGet([
          `Starling-${STARLING_FEED_ITEM_1.feedItemUid}`,
          `Starling-${STARLING_FEED_ITEM_2.feedItemUid}`
        ])
      ).toEqual([
        [`Starling-${STARLING_FEED_ITEM_1.feedItemUid}`, Category.SAVINGS],
        [`Starling-${STARLING_FEED_ITEM_2.feedItemUid}`, null]
      ]);
    });
  });

  describe("useGetAllMappedTruelayerTransactions", () => {
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

    test("uses default category values - no categories are put in storage", async () => {
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
          category: Category.BILLS,
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
          category: Category.EATING_OUT,
          timestamp: new Date(
            TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS.timestamp
          ),
          source: Source.TRUELAYER
        }
      ]);
      expect(await AsyncStorage.getAllKeys()).toEqual([]);
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
        "Truelayer-a15d8156569ba848d84c07c34d291bca",
        Category.SAVINGS
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
          category: Category.SAVINGS,
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
          category: Category.EATING_OUT,
          timestamp: new Date(
            TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS.timestamp
          ),
          source: Source.TRUELAYER
        }
      ]);
      expect(
        await AsyncStorage.multiGet([
          "Truelayer-a15d8156569ba848d84c07c34d291bca",
          "Truelayer-1234094-shocking-chipotle"
        ])
      ).toEqual([
        ["Truelayer-a15d8156569ba848d84c07c34d291bca", Category.SAVINGS],
        ["Truelayer-1234094-shocking-chipotle", null]
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
        "Truelayer-a15d8156569ba848d84c07c34d291bca",
        Category.SAVINGS
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
          category: Category.SAVINGS,
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
          category: Category.EATING_OUT,
          timestamp: new Date(
            TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS.timestamp
          ),
          source: Source.TRUELAYER
        },
        {
          id: "1234000-chai-pot",
          name: "CHAI POT YUM",
          description: "Food & Dining",
          amount: 3.3,
          category: Category.EATING_OUT,
          timestamp: new Date(
            TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.timestamp
          ),
          source: Source.TRUELAYER
        }
      ]);
      expect(
        await AsyncStorage.multiGet([
          "Truelayer-a15d8156569ba848d84c07c34d291bca",
          "Truelayer-1234094-shocking-chipotle",
          "Truelayer-1234000-chai-pot"
        ])
      ).toEqual([
        ["Truelayer-a15d8156569ba848d84c07c34d291bca", Category.SAVINGS],
        ["Truelayer-1234094-shocking-chipotle", null],
        ["Truelayer-1234000-chai-pot", null]
      ]);
    });
  });

  describe("useGetTransactions", () => {
    test("returns loading if loading starling transactions", async () => {
      // setup mocks
      nock(config.integrations.starling.sandboxUrl)
        .get("/v2/accounts")
        .delay(2000)
        .reply(200, {accounts: [STARLING_ACCOUNT_1]})
        // matches any url of the form "v2/feed/account/<uuid>/category/<uuid>/transactions-between"
        .get(
          /\/v2\/feed\/account\/([0-9a-z-]+)\/category\/([0-9a-z-]+)\/transactions-between/
        )
        .reply(200, {feedItems: [STARLING_FEED_ITEM_1]});

      nock(config.integrations.trueLayer.sandboxDataUrl)
        .get("/v1/cards")
        .reply(200, {
          results: [TRUELAYER_MASTERCARD],
          status: "Succeeded"
        })
        // matches any url of the form "v1/cards/<uuid>/transactions"
        .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
        .reply(200, {
          results: [TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS],
          status: "Succeeded"
        })
        // matches any url of the form "v1/cards/<uuid>/transactions/pending"
        .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions\/pending/)
        .reply(200, {
          results: [TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS],
          status: "Succeeded"
        });

      const {result} = renderHook(() => useGetTransactions());
      await waitFor(() =>
        expect(result.current.transactions).toEqual([
          {
            id: TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.transaction_id,
            name: TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.description,
            description:
              TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS
                .transaction_classification[0],
            amount:
              TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.amount,
            category: Category.EATING_OUT,
            timestamp: new Date(
              TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.timestamp
            ),
            source: Source.TRUELAYER
          },
          {
            id: TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.transaction_id,
            name: TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.description,
            description:
              TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
                .transaction_classification[0],
            amount: TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.amount,
            category: Category.BILLS,
            timestamp: new Date(
              TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.timestamp
            ),
            source: Source.TRUELAYER
          }
        ])
      );
      expect(result.current.isLoading).toBe(true);
    });

    test("returns loading if loading truelayer transactions", async () => {
      // setup mocks
      nock(config.integrations.starling.sandboxUrl)
        .get("/v2/accounts")
        .reply(200, {accounts: [STARLING_ACCOUNT_1]})
        // matches any url of the form "v2/feed/account/<uuid>/category/<uuid>/transactions-between"
        .get(
          /\/v2\/feed\/account\/([0-9a-z-]+)\/category\/([0-9a-z-]+)\/transactions-between/
        )
        .reply(200, {feedItems: [STARLING_FEED_ITEM_1]});

      nock(config.integrations.trueLayer.sandboxDataUrl)
        .get("/v1/cards")
        .delay(2000)
        .reply(200, {
          results: [TRUELAYER_MASTERCARD],
          status: "Succeeded"
        })
        // matches any url of the form "v1/cards/<uuid>/transactions"
        .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
        .reply(200, {
          results: [TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS],
          status: "Succeeded"
        })
        // matches any url of the form "v1/cards/<uuid>/transactions/pending"
        .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions\/pending/)
        .reply(200, {
          results: [TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS],
          status: "Succeeded"
        });

      const {result} = renderHook(() => useGetTransactions());
      await waitFor(() =>
        expect(result.current.transactions).toEqual([
          {
            id: STARLING_FEED_ITEM_1.feedItemUid,
            name: STARLING_FEED_ITEM_1.counterPartyName,
            description: STARLING_FEED_ITEM_1.spendingCategory,
            amount: STARLING_FEED_ITEM_1.amount.minorUnits / 100,
            category: Category.TRANSPORT,
            timestamp: new Date(STARLING_FEED_ITEM_1.transactionTime),
            source: Source.STARLING
          }
        ])
      );
      expect(result.current.isLoading).toBe(true);
    });

    test("combines transactions and sorts by timestamp", async () => {
      // setup mocks
      nock(config.integrations.starling.sandboxUrl)
        .get("/v2/accounts")
        .reply(200, {accounts: [STARLING_ACCOUNT_1]})
        // matches any url of the form "v2/feed/account/<uuid>/category/<uuid>/transactions-between"
        .get(
          /\/v2\/feed\/account\/([0-9a-z-]+)\/category\/([0-9a-z-]+)\/transactions-between/
        )
        .reply(200, {feedItems: [STARLING_FEED_ITEM_1]});

      nock(config.integrations.trueLayer.sandboxDataUrl)
        .get("/v1/cards")
        .reply(200, {
          results: [TRUELAYER_MASTERCARD],
          status: "Succeeded"
        })
        // matches any url of the form "v1/cards/<uuid>/transactions"
        .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
        .reply(200, {
          results: [TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS],
          status: "Succeeded"
        })
        // matches any url of the form "v1/cards/<uuid>/transactions/pending"
        .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions\/pending/)
        .reply(200, {
          results: [TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS],
          status: "Succeeded"
        });

      const {result} = renderHook(() => useGetTransactions());
      await waitFor(() =>
        expect(result.current.transactions).toEqual([
          {
            id: TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.transaction_id,
            name: TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.description,
            description:
              TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS
                .transaction_classification[0],
            amount:
              TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.amount,
            category: Category.EATING_OUT,
            timestamp: new Date(
              TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.timestamp
            ),
            source: Source.TRUELAYER
          },
          {
            id: TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.transaction_id,
            name: TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.description,
            description:
              TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
                .transaction_classification[0],
            amount: TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.amount,
            category: Category.BILLS,
            timestamp: new Date(
              TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.timestamp
            ),
            source: Source.TRUELAYER
          },
          {
            id: STARLING_FEED_ITEM_1.feedItemUid,
            name: STARLING_FEED_ITEM_1.counterPartyName,
            description: STARLING_FEED_ITEM_1.spendingCategory,
            amount: STARLING_FEED_ITEM_1.amount.minorUnits / 100,
            category: Category.TRANSPORT,
            timestamp: new Date(STARLING_FEED_ITEM_1.transactionTime),
            source: Source.STARLING
          }
        ])
      );
      expect(result.current.isLoading).toBe(false);
    });

    test("refetches all transactions", async () => {
      // setup mocks
      nock(config.integrations.starling.sandboxUrl)
        .get("/v2/accounts")
        .reply(200, {accounts: [STARLING_ACCOUNT_1]})
        // second call
        .get("/v2/accounts")
        .reply(200, {accounts: []})
        // matches any url of the form "v2/feed/account/<uuid>/category/<uuid>/transactions-between"
        .get(
          /\/v2\/feed\/account\/([0-9a-z-]+)\/category\/([0-9a-z-]+)\/transactions-between/
        )
        .reply(200, {feedItems: [STARLING_FEED_ITEM_1]});

      nock(config.integrations.trueLayer.sandboxDataUrl)
        .get("/v1/cards")
        .reply(200, {
          results: [TRUELAYER_MASTERCARD],
          status: "Succeeded"
        })
        // second call
        .get("/v1/cards")
        .reply(200, {
          results: [],
          status: "Succeeded"
        })
        // matches any url of the form "v1/cards/<uuid>/transactions"
        .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
        .reply(200, {
          results: [TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS],
          status: "Succeeded"
        })
        // matches any url of the form "v1/cards/<uuid>/transactions/pending"
        .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions\/pending/)
        .reply(200, {
          results: [],
          status: "Succeeded"
        });

      const {result} = renderHook(() => useGetTransactions());
      await waitFor(() =>
        expect(result.current.transactions).toEqual([
          {
            id: TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.transaction_id,
            name: TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.description,
            description:
              TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS
                .transaction_classification[0],
            amount:
              TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.amount,
            category: Category.EATING_OUT,
            timestamp: new Date(
              TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.timestamp
            ),
            source: Source.TRUELAYER
          },
          {
            id: STARLING_FEED_ITEM_1.feedItemUid,
            name: STARLING_FEED_ITEM_1.counterPartyName,
            description: STARLING_FEED_ITEM_1.spendingCategory,
            amount: STARLING_FEED_ITEM_1.amount.minorUnits / 100,
            category: Category.TRANSPORT,
            timestamp: new Date(STARLING_FEED_ITEM_1.transactionTime),
            source: Source.STARLING
          }
        ])
      );
      expect(result.current.isLoading).toBe(false);

      act(() => result.current.refetch());

      await waitFor(() => expect(result.current.transactions).toEqual([]));
      expect(result.current.isLoading).toBe(false);
    });

    test("can get transactions by date", async () => {
      // setup mocks
      nock(config.integrations.starling.sandboxUrl)
        .get("/v2/accounts")
        .reply(200, {accounts: [STARLING_ACCOUNT_1]})
        // matches any url of the form "v2/feed/account/<uuid>/category/<uuid>/transactions-between"
        .get(
          /\/v2\/feed\/account\/([0-9a-z-]+)\/category\/([0-9a-z-]+)\/transactions-between/
        )
        .reply(200, {feedItems: []});

      nock(config.integrations.trueLayer.sandboxDataUrl)
        .get("/v1/cards")
        .reply(200, {
          results: [TRUELAYER_MASTERCARD],
          status: "Succeeded"
        })
        // matches any url of the form "v1/cards/<uuid>/transactions"
        .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
        .reply(200, {
          results: [TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS],
          status: "Succeeded"
        })
        // matches any url of the form "v1/cards/<uuid>/transactions/pending"
        .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions\/pending/)
        .reply(200, {
          results: [TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS],
          status: "Succeeded"
        });

      const {result} = renderHook(() =>
        useGetTransactions({
          dateRange: {from: new Date("2023-03-01"), to: new Date("2023-04-01")}
        })
      );

      await waitFor(() =>
        expect(result.current.transactions).toEqual([
          {
            id: TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.transaction_id,
            name: TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.description,
            description:
              TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS
                .transaction_classification[0],
            amount:
              TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.amount,
            category: Category.EATING_OUT,
            timestamp: new Date(
              TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS.timestamp
            ),
            source: Source.TRUELAYER
          }
        ])
      );
      expect(result.current.isLoading).toBe(false);
    });

    test("can disable transactions", async () => {
      // setup mocks
      nock(config.integrations.starling.sandboxUrl)
        .get("/v2/accounts")
        .reply(200, {accounts: [STARLING_ACCOUNT_1]})
        // matches any url of the form "v2/feed/account/<uuid>/category/<uuid>/transactions-between"
        .get(
          /\/v2\/feed\/account\/([0-9a-z-]+)\/category\/([0-9a-z-]+)\/transactions-between/
        )
        .reply(200, {feedItems: [STARLING_FEED_ITEM_1]});

      nock(config.integrations.trueLayer.sandboxDataUrl)
        .get("/v1/cards")
        .reply(200, {
          results: [TRUELAYER_MASTERCARD],
          status: "Succeeded"
        })
        // matches any url of the form "v1/cards/<uuid>/transactions"
        .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
        .reply(200, {
          results: [TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS],
          status: "Succeeded"
        })
        // matches any url of the form "v1/cards/<uuid>/transactions/pending"
        .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions\/pending/)
        .reply(200, {
          results: [TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS],
          status: "Succeeded"
        });

      const {result} = renderHook(() => useGetTransactions({enabled: false}));
      expect(result.current.isLoading).toBe(true);
      expect(result.current.transactions).toEqual([]);
    });
  });
});
