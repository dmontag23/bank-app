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
};

const TransactionList = ({transactions, categoryMap}: TransactionListProps) => (
  // TODO: Improve performance of this list
  <FlatList
    data={transactions}
    renderItem={({item}) => (
      <Transaction transaction={item} categoryMap={categoryMap} />
    )}
  />
);

export default TransactionList;
