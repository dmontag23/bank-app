import {
  Currency,
  StarlingAccount,
  StarlingAccountType
} from "../../../types/starling/accounts";

export const STARLING_ACCOUNT_1: StarlingAccount = {
  accountUid: "starling-account-id-1",
  accountType: StarlingAccountType.PRIMARY,
  defaultCategory: "starling-category-id-1",
  currency: Currency.GBP,
  createdAt: new Date("2023-12-01").toISOString(),
  name: "starling-account-name-1"
};
