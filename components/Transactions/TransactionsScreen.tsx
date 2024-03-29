import React from "react";
import {StyleSheet, View} from "react-native";
import {Text} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import TransactionList from "./TransactionList";

import useGetCategoryMap from "../../hooks/transactions/useGetCategoryMap";
import useGetTransactions from "../../hooks/transactions/useGetTransactions";
import LoadingSpinner from "../ui/LoadingSpinner";

const TransactionsScreen = () => {
  const {
    isLoading: isTransactionsLoading,
    transactions,
    refetch: refetchTransactions,
    isRefetching: isTransactionsRefetching
  } = useGetTransactions();

  const {isLoading: isCategoryMapLoading, data: categoryMap} =
    useGetCategoryMap();

  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      {isTransactionsLoading || isCategoryMapLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Text variant="displaySmall" style={styles.text}>
            Transactions
          </Text>
          <TransactionList
            transactions={transactions}
            categoryMap={categoryMap ?? {}}
            onRefetchTransactions={refetchTransactions}
            isRefetchingTransactions={isTransactionsRefetching}
          />
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
