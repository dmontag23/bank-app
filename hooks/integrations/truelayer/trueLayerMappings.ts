import {Source, Transaction} from "../../../types/transaction";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";

const mapTrueLayerCategoryToInternalCategory = (
  trueLayerTransactionCategory: string
) =>
  // TODO: ensure the values map to one of the initial category keys
  ({
    "Bills and Utilities": "Bills",
    "Food & Dining": "Eating out",
    Shopping: "Shopping",
    Entertainment: "Entertainment"
  }[trueLayerTransactionCategory] || "Unknown");

export const mapTrueLayerTransactionToInternalTransaction = (
  trueLayerTransaction: CardTransaction
): Transaction => ({
  id: trueLayerTransaction.transaction_id,
  name: trueLayerTransaction.description,
  description: trueLayerTransaction.transaction_classification[0],
  amount: trueLayerTransaction.amount,
  category: mapTrueLayerCategoryToInternalCategory(
    trueLayerTransaction.transaction_classification[0]
  ),
  timestamp: new Date(trueLayerTransaction.timestamp),
  source: Source.TRUELAYER
});
