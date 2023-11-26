import {Source, Transaction} from "../../../types/transaction";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";

export const mapTrueLayerCategoryToInternalCategory = (
  trueLayerTransactionCategories: string[]
) =>
  // TODO: ensure the values map to one of the initial category keys
  ({
    "Bills and Utilities": "Bills",
    "Food & Dining": "Eating out",
    Shopping: "Shopping",
    Entertainment: "Entertainment"
  }[trueLayerTransactionCategories[0]] || "Unknown");

export const mapTrueLayerTransactionToInternalTransaction = (
  trueLayerTransaction: CardTransaction,
  category: string
): Transaction => ({
  id: trueLayerTransaction.transaction_id,
  name: trueLayerTransaction.description,
  description: trueLayerTransaction.transaction_classification[0],
  amount: trueLayerTransaction.amount,
  category,
  timestamp: new Date(trueLayerTransaction.timestamp),
  source: Source.TRUELAYER
});
