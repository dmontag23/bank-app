import {
  SpendingCategory,
  StarlingFeedItem
} from "../../../types/starling/feedItems";
import {Category, Source, Transaction} from "../../../types/transaction";

const mapStarlingCategoryToInternalCategory = (
  starlingTransactionCategory: SpendingCategory
) =>
  ({
    [SpendingCategory.ADMIN]: Category.BUSINESS,
    [SpendingCategory.BANK_CHARGES]: Category.BILLS,
    [SpendingCategory.BIKE]: Category.FITNESS,
    [SpendingCategory.BILLS_AND_SERVICES]: Category.BILLS,
    [SpendingCategory.BUCKET_LIST]: Category.ENTERTAINMENT,
    [SpendingCategory.BUSINESS_ENTERTAINMENT]: Category.BUSINESS,
    [SpendingCategory.CAR]: Category.TRANSPORT,
    [SpendingCategory.CASH]: Category.CASH,
    [SpendingCategory.CELEBRATION]: Category.ENTERTAINMENT,
    [SpendingCategory.CHARITY]: Category.CHARITY,
    [SpendingCategory.CHILDREN]: Category.HOME,
    [SpendingCategory.CLIENT_REFUNDS]: Category.BUSINESS,
    [SpendingCategory.CLOTHES]: Category.CLOTHES,
    [SpendingCategory.COFFEE]: Category.COFFEE,
    [SpendingCategory.CORPORATION_TAX]: Category.BUSINESS,
    [SpendingCategory.DEBT_REPAYMENT]: Category.BILLS,
    [SpendingCategory.DIRECTORS_WAGES]: Category.BUSINESS,
    [SpendingCategory.DIVIDENDS]: Category.INCOME,
    [SpendingCategory.DIY]: Category.HOME,
    [SpendingCategory.DRINKS]: Category.DRINKS,
    [SpendingCategory.EATING_OUT]: Category.EATING_OUT,
    [SpendingCategory.EDUCATION]: Category.BILLS,
    [SpendingCategory.EMERGENCY]: Category.MEDICAL,
    [SpendingCategory.ENTERTAINMENT]: Category.ENTERTAINMENT,
    [SpendingCategory.EQUIPMENT]: Category.HOME,
    [SpendingCategory.ESSENTIAL_SPEND]: Category.BILLS,
    [SpendingCategory.EXPENSES]: Category.BILLS,
    [SpendingCategory.FAMILY]: Category.HOME,
    [SpendingCategory.FITNESS]: Category.FITNESS,
    [SpendingCategory.FOOD_AND_DRINK]: Category.EATING_OUT,
    [SpendingCategory.FUEL]: Category.TRANSPORT,
    [SpendingCategory.GAMBLING]: Category.ENTERTAINMENT,
    [SpendingCategory.GAMING]: Category.GAMING,
    [SpendingCategory.GARDEN]: Category.HOME,
    [SpendingCategory.GENERAL]: Category.HOME,
    [SpendingCategory.GIFTS]: Category.GIFTS,
    [SpendingCategory.GROCERIES]: Category.GROCERIES,
    [SpendingCategory.HOBBY]: Category.ENTERTAINMENT,
    [SpendingCategory.HOLIDAYS]: Category.HOLIDAYS,
    [SpendingCategory.HOME]: Category.HOME,
    [SpendingCategory.IMPULSE_BUY]: Category.ENTERTAINMENT,
    [SpendingCategory.INCOME]: Category.INCOME,
    [SpendingCategory.INSURANCE]: Category.BILLS,
    [SpendingCategory.INTEREST_PAYMENTS]: Category.INCOME,
    [SpendingCategory.INVENTORY]: Category.BUSINESS,
    [SpendingCategory.INVESTMENTS]: Category.SAVINGS,
    [SpendingCategory.INVESTMENT_CAPITAL]: Category.BUSINESS,
    [SpendingCategory.LIFESTYLE]: Category.FITNESS,
    [SpendingCategory.LOAN_PRINCIPAL]: Category.BUSINESS,
    [SpendingCategory.MAINTENANCE_AND_REPAIRS]: Category.HOME,
    [SpendingCategory.MARKETING]: Category.BUSINESS,
    [SpendingCategory.MEDICAL]: Category.MEDICAL,
    [SpendingCategory.MORTGAGE]: Category.MORTGAGE,
    [SpendingCategory.NONE]: Category.UNKNOWN,
    [SpendingCategory.NON_ESSENTIAL_SPEND]: Category.ENTERTAINMENT,
    [SpendingCategory.OTHER]: Category.UNKNOWN,
    [SpendingCategory.OTHER_INCOME]: Category.INCOME,
    [SpendingCategory.PAYMENTS]: Category.ENTERTAINMENT,
    [SpendingCategory.PERSONAL]: Category.HOME,
    [SpendingCategory.PERSONAL_CARE]: Category.HOME,
    [SpendingCategory.PERSONAL_TRANSFERS]: Category.ENTERTAINMENT,
    [SpendingCategory.PETS]: Category.BILLS,
    [SpendingCategory.PHONE_AND_INTERNET]: Category.BILLS,
    [SpendingCategory.PROFESSIONAL_SERVICES]: Category.BUSINESS,
    [SpendingCategory.PROJECTS]: Category.HOME,
    [SpendingCategory.RELATIONSHIPS]: Category.ENTERTAINMENT,
    [SpendingCategory.RENT]: Category.RENT,
    [SpendingCategory.REPAIRS_AND_MAINTENANCE]: Category.HOME,
    [SpendingCategory.REVENUE]: Category.BUSINESS,
    [SpendingCategory.SAVING]: Category.SAVINGS,
    [SpendingCategory.SELF_ASSESSMENT_TAX]: Category.BILLS,
    [SpendingCategory.SHOPPING]: Category.SHOPPING,
    [SpendingCategory.STAFF]: Category.BUSINESS,
    [SpendingCategory.SUBSCRIPTIONS]: Category.ENTERTAINMENT,
    [SpendingCategory.TAKEAWAY]: Category.EATING_OUT,
    [SpendingCategory.TAXI]: Category.TRANSPORT,
    [SpendingCategory.TRANSFERS]: Category.ENTERTAINMENT,
    [SpendingCategory.TRANSPORT]: Category.TRANSPORT,
    [SpendingCategory.TRAVEL]: Category.HOLIDAYS,
    [SpendingCategory.TREATS]: Category.EATING_OUT,
    [SpendingCategory.VAT]: Category.BUSINESS,
    [SpendingCategory.VEHICLES]: Category.TRANSPORT,
    [SpendingCategory.WEDDING]: Category.GIFTS,
    [SpendingCategory.WELLBEING]: Category.FITNESS,
    [SpendingCategory.WORKPLACE]: Category.BUSINESS
  }[starlingTransactionCategory] || Category.UNKNOWN);

export const mapStarlingTransactionToInternalTransaction = (
  starlingTransaction: StarlingFeedItem
): Transaction => ({
  id: starlingTransaction.feedItemUid,
  name: starlingTransaction.counterPartyName,
  description: starlingTransaction.spendingCategory,
  amount: starlingTransaction.amount.minorUnits / 100, // TODO: MAKE THIS NUM BASED ON CURRENCY!
  category: mapStarlingCategoryToInternalCategory(
    starlingTransaction.spendingCategory
  ),
  timestamp: new Date(starlingTransaction.transactionTime),
  source: Source.STARLING
});