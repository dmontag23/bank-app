import React from "react";
import {StyleSheet, View} from "react-native";
import {Text} from "react-native-paper";

import TransactionList from "./TransactionList";

import useTransactions from "../../hooks/useTransactions";
import LoadingSpinner from "../LoadingSpinner";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  }
});

const TransactionsScene = () => {
  // TODO: Come back and use actual account number
  const {isLoading, transactions} = useTransactions(
    "2cbf9b6063102763ccbe3ea62f1b3e72"
  );
  return (
    <View style={styles.container}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Text variant="displaySmall">Transactions</Text>
          <TransactionList transactions={transactions} />
        </>
      )}
    </View>
  );
};

export default TransactionsScene;