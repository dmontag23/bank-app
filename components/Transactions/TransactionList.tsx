import React from "react";
import {FlatList, RefreshControl, StyleSheet, View} from "react-native";

import Transaction from "./Transaction";

import {
  CategoryMap,
  Transaction as TransactionType
} from "../../types/transaction";
import LoadingSpinner from "../ui/LoadingSpinner";

const TRANSACTION_ITEM_HEIGHT = 65;

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
  <>
    {isRefetchingTransactions && (
      <View style={styles.loadingSpinnerContainer}>
        <LoadingSpinner />
      </View>
    )}
    <FlatList
      accessibilityLabel="Transaction list"
      data={transactions}
      renderItem={({item}) => (
        // this wrapper view is added to give the transactions a fixed height,
        // which allows getItemLayout to be used to greatly improve the performance
        // of the list
        <View style={{height: TRANSACTION_ITEM_HEIGHT}}>
          <Transaction transaction={item} categoryMap={categoryMap} />
        </View>
      )}
      getItemLayout={(_, index) => ({
        length: TRANSACTION_ITEM_HEIGHT,
        offset: TRANSACTION_ITEM_HEIGHT * index,
        index
      })}
      refreshControl={
        // the conditional here is used to remove the padding at the top of the list
        // when the list is refreshing
        !isRefetchingTransactions ? (
          <RefreshControl
            refreshing={false}
            onRefresh={onRefetchTransactions}
            tintColor={styles.refreshSpinner.backgroundColor}
          />
        ) : undefined
      }
    />
  </>
);

export default TransactionList;

const styles = StyleSheet.create({
  loadingSpinnerContainer: {marginBottom: 10},
  // the transparent style is needed here to hide the default refresh spinner
  refreshSpinner: {backgroundColor: "transparent"}
});
