import {Transaction, TransactionCategory} from "../../../types/transaction";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";

export const mapTrueLayerCategoryToInternalCategory = (
  trueLayerTransactionCategories: string[]
) =>
  ({
    "Bills and Utilities": TransactionCategory.BILLS,
    "Food & Dining": TransactionCategory.EATING_OUT,
    Shopping: TransactionCategory.ENTERTAINMENT
  }[trueLayerTransactionCategories[0]] || TransactionCategory.UNKNOWN);

export const mapTrueLayerTransactionToInternalTransaction = (
  trueLayerTransaction: CardTransaction,
  category: TransactionCategory
): Transaction => ({
  name: trueLayerTransaction.description,
  description: trueLayerTransaction.transaction_classification[0],
  amount: trueLayerTransaction.amount,
  category
});
