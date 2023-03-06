import {Transaction, TransactionCategory} from "../../../types/transaction";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";

export const mapTrueLayerTransactionClassificationToInternalCategory = (
  category: string[]
) =>
  ({
    "Bills and Utilities": TransactionCategory.BILLS,
    Shopping: TransactionCategory.ENTERTAINMENT
  }[category[0]] || TransactionCategory.UNKNOWN);

export const mapTrueLayerTransactionToInternalTransaction = (
  trueLayerTransaction: CardTransaction
): Transaction => ({
  name: trueLayerTransaction.description,
  description: trueLayerTransaction.transaction_classification[0],
  amount: trueLayerTransaction.amount,
  category: mapTrueLayerTransactionClassificationToInternalCategory(
    trueLayerTransaction.transaction_classification
  )
});
