import React from "react";
import {FlatList} from "react-native";

import Transaction from "./Transaction";

import {
  CategoryMap,
  Transaction as TransactionType
} from "../../types/transaction";

type TransactionListProps = {
  transactions: TransactionType[];
  categoryMap: CategoryMap;
  onRefetchTransactions?: () => void;
  isRefetchingTransactions?: boolean;
};

const TransactionList = ({
  transactions,
  categoryMap,
  onRefetchTransactions,
  isRefetchingTransactions
}: TransactionListProps) => (
  // TODO: Improve performance of this list
  <FlatList
    accessibilityLabel="Transaction list"
    data={transactions}
    onRefresh={onRefetchTransactions}
    refreshing={isRefetchingTransactions}
    renderItem={({item}) => (
      <Transaction transaction={item} categoryMap={categoryMap} />
    )}
  />
);

export default TransactionList;
