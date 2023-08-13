import React from "react";
import {StyleSheet, View} from "react-native";
import {Text} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import TransactionList from "./TransactionList";

import useTransactions from "../../hooks/transactions/useTransactions";
import LoadingSpinner from "../ui/LoadingSpinner";

const TransactionsScreen = () => {
  // TODO: Come back and use actual account number
  const {isLoading, transactions} = useTransactions(
    "2cbf9b6063102763ccbe3ea62f1b3e72"
  );
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        ...styles.container,
        paddingTop: insets.top
      }}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Text variant="displaySmall" style={styles.text}>
            Transactions
          </Text>
          <TransactionList transactions={transactions} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: "center"},
  text: {marginVertical: 20, textAlign: "center"}
});

export default TransactionsScreen;
