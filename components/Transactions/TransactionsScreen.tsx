import React from "react";
import {StyleSheet, View} from "react-native";
import {Text} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import TransactionList from "./TransactionList";

import useGetAllMappedTruelayerTransactions from "../../hooks/integrations/truelayer/useGetAllMappedTruelayerTransactions";
import useGetCategoryMap from "../../hooks/transactions/useGetCategoryMap";
import useOnFocus from "../../hooks/utils/useOnFocus";
import LoadingSpinner from "../ui/LoadingSpinner";

const TransactionsScreen = () => {
  // useTransactions is initially disabled because useOnFocus will call
  // refetch as soon as the screen is focused, which will get the data
  // setting enabled to false here prevents unnecessary api call(s)
  const {
    isLoading: isTransactionsLoading,
    transactions,
    refetch
  } = useGetAllMappedTruelayerTransactions({enabled: false});

  const {isLoading: isCategoryMapLoading, data: categoryMap} =
    useGetCategoryMap();

  useOnFocus(refetch);

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
