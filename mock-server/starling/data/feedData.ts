import {Currency} from "../../../types/starling/accounts";
import {
  BatchPaymentType,
  CounterParty,
  Country,
  Direction,
  Source,
  SpendingCategory,
  StarlingFeedItem,
  Status,
  SubSource
} from "../../../types/starling/feedItems";

export const STARLING_FEED_ITEM_1: StarlingFeedItem = {
  feedItemUid: "starling-feed-item-1",
  categoryUid: "starling-category-id-1",
  amount: {
    currency: Currency.GBP,
    minorUnits: 999
  },
  sourceAmount: {
    currency: Currency.GBP,
    minorUnits: 999
  },
  direction: Direction.OUT,
  updatedAt: new Date("2023-12-01").toISOString(),
  transactionTime: new Date("2023-11-30").toISOString(),
  settlementTime: new Date("2023-12-01").toISOString(),
  retryAllocationUntilTime: "",
  source: Source.MASTER_CARD,
  sourceSubType: SubSource.CONTACTLESS,
  status: Status.SETTLED,
  transactingApplicationUserUid: "transaction-application-user-id",
  counterPartyType: CounterParty.CATEGORY,
  counterPartyUid: "counter-party-id-1",
  counterPartyName: "counter-party-name-1",
  counterPartySubEntityUid: "counter-party-sub-entity-id-1",
  counterPartySubEntityName: "counter-party-sub-entity-name-1",
  counterPartySubEntityIdentifier: "counter-party-sub-entity-identifier-1",
  exchangeRate: 0,
  totalFees: 0,
  totalFeeAmount: {
    currency: Currency.GBP,
    minorUnits: 0
  },
  reference: "reference",
  country: Country.UK,
  spendingCategory: SpendingCategory.TRANSPORT,
  userNote: "user-note",
  roundUp: {
    goalCategoryUid: "goal-category-uuid-1",
    amount: {
      currency: Currency.GBP,
      minorUnits: 1
    }
  },
  hasAttachment: false,
  hasReceipt: false,
  batchPaymentDetails: {
    batchPaymentUid: "batch-payment-id-1",
    batchPaymentType: BatchPaymentType.BULK_PAYMENT
  }
};

export const STARLING_FEED_ITEM_2: StarlingFeedItem = {
  feedItemUid: "starling-feed-item-2",
  categoryUid: "starling-category-id-2",
  amount: {
    currency: Currency.EUR,
    minorUnits: 50
  },
  sourceAmount: {
    currency: Currency.USD,
    minorUnits: 62
  },
  direction: Direction.IN,
  updatedAt: new Date("2020-01-01").toISOString(),
  transactionTime: new Date("2020-01-01").toISOString(),
  settlementTime: new Date("2020-01-01").toISOString(),
  retryAllocationUntilTime: "",
  source: Source.CASH_DEPOSIT,
  sourceSubType: SubSource.CONTACTLESS,
  status: Status.PENDING,
  transactingApplicationUserUid: "",
  counterPartyType: CounterParty.STARLING,
  counterPartyUid: "counter-party-id-2",
  counterPartyName: "Starling Bank",
  counterPartySubEntityUid: "counter-party-sub-entity-id-2",
  counterPartySubEntityName: "counter-party-sub-entity-name-2",
  counterPartySubEntityIdentifier: "counter-party-sub-entity-identifier-2",
  exchangeRate: 0.82,
  totalFees: 10,
  totalFeeAmount: {
    currency: Currency.EUR,
    minorUnits: 10
  },
  reference: "reference",
  country: Country.IT,
  spendingCategory: SpendingCategory.INCOME,
  userNote: "",
  roundUp: {
    goalCategoryUid: "goal-category-uuid-2",
    amount: {
      currency: Currency.EUR,
      minorUnits: 50
    }
  },
  hasAttachment: false,
  hasReceipt: false,
  batchPaymentDetails: {
    batchPaymentUid: "batch-payment-id-2",
    batchPaymentType: BatchPaymentType.BULK_PAYMENT
  }
};
