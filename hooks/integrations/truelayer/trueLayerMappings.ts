import {Category, Source, Transaction} from "../../../types/transaction";
import {
  CardTransaction,
  TruelayerTransactionClassification
} from "../../../types/trueLayer/dataAPI/cards";

const mapTrueLayerCategoryToInternalCategory = (
  trueLayerTransactionCategory: TruelayerTransactionClassification
) =>
  ({
    [TruelayerTransactionClassification.AUTO_AND_TRANSPORT]: Category.TRANSPORT,
    [TruelayerTransactionClassification.BILLS_AND_UTILITIES]: Category.BILLS,
    [TruelayerTransactionClassification.BUSINESS_SERVICES]: Category.BUSINESS,
    [TruelayerTransactionClassification.EDUCATION]: Category.BILLS,
    [TruelayerTransactionClassification.ENTERTAINMENT]: Category.ENTERTAINMENT,
    [TruelayerTransactionClassification.FEES_AND_CHARGES]: Category.BILLS,
    [TruelayerTransactionClassification.FOOD_AND_DINING]: Category.EATING_OUT,
    [TruelayerTransactionClassification.GAMBLING]: Category.ENTERTAINMENT,
    [TruelayerTransactionClassification.GIFTS_AND_DONATIONS]: Category.GIFTS,
    [TruelayerTransactionClassification.HEALTH_AND_FITNESS]: Category.FITNESS,
    [TruelayerTransactionClassification.HOME]: Category.HOME,
    [TruelayerTransactionClassification.INVESTMENTS]: Category.BUSINESS,
    [TruelayerTransactionClassification.PENSIONS_AND_INSURANCES]:
      Category.BILLS,
    [TruelayerTransactionClassification.PERSONAL_CARE]: Category.HOME,
    [TruelayerTransactionClassification.PERSONAL_SERVICES]: Category.BILLS,
    [TruelayerTransactionClassification.SHOPPING]: Category.SHOPPING,
    [TruelayerTransactionClassification.TAXES]: Category.BILLS,
    [TruelayerTransactionClassification.TRAVEL]: Category.TRANSPORT,
    [TruelayerTransactionClassification.UNCATEGORIZED]: Category.CASH
  }[trueLayerTransactionCategory] || Category.UNKNOWN);

export const mapTrueLayerTransactionToInternalTransaction = (
  trueLayerTransaction: CardTransaction
): Transaction => ({
  id: trueLayerTransaction.transaction_id,
  name: trueLayerTransaction.description,
  description: trueLayerTransaction.transaction_classification[0],
  amount: trueLayerTransaction.amount,
  category: mapTrueLayerCategoryToInternalCategory(
    // the typecasting here is needed because transaction_classification is typed as a string[]
    // for simplicity, see types/trueLayer/dataAPI/cards.ts
    trueLayerTransaction
      .transaction_classification[0] as TruelayerTransactionClassification
  ),
  timestamp: new Date(trueLayerTransaction.timestamp),
  source: Source.TRUELAYER
});
