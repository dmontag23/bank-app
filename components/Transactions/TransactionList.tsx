import React from "react";
import {FlatList} from "react-native";

import Transaction from "./Transaction";

import {Transaction as TransactionType} from "../../types/transaction";

type TransactionListProps = {
  transactions: TransactionType[];
};

const TransactionList = ({transactions}: TransactionListProps) => (
  <FlatList
    data={transactions}
    renderItem={({item}) => <Transaction transaction={item} />}
  />
);

export default TransactionList;
