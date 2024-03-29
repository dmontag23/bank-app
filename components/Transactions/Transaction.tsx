import React, {useState} from "react";
import {StyleSheet, useWindowDimensions, View} from "react-native";
import {Dialog, List, Portal, Text} from "react-native-paper";
import {IconSource} from "react-native-paper/lib/typescript/components/Icon";

import CategoryList from "./CategoryList";

import {INITIAL_CATEGORY_MAP} from "../../constants";
import useStoreTransactionCategoryMap from "../../hooks/transactions/useStoreTransactionCategoryMap";
import {
  Category,
  CategoryMap,
  Transaction as TransactionType
} from "../../types/transaction";
import CategoryIcon from "../ui/CategoryIcon";

// note that, in theory, combining the date and time in toLocaleString is possible, but
// the implementation of toLocaleString can be different in Node and in
// react, see https://github.com/jestjs/jest/issues/3514
const createDescriptionString = (transaction: TransactionType) => {
  const dateString = transaction.timestamp.toDateString().slice(4);

  const timeString = transaction.timestamp.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  return `${dateString} at ${timeString}  -  ${transaction.category}`;
};

const ListIcon = ({icon, color}: {icon: IconSource; color: string}) => (
  <CategoryIcon icon={icon} color={color} />
);

const RightText = (amount: number) => (
  // TODO: Make this based on currency of transaction
  // TODO: Might want to consider toLocaleString instead of
  // toFixed to avoid rounding issues with toFixed
  <Text variant="titleMedium">{`£${amount.toFixed(2)}`}</Text>
);

type TransactionComponentProps = {
  transaction: TransactionType;
  categoryMap: CategoryMap;
};
const Transaction = ({transaction, categoryMap}: TransactionComponentProps) => {
  const {mutate: storeTransactionToCategoryMap} =
    useStoreTransactionCategoryMap();

  const [isEditTransactionDialogVisible, setIsEditTransactionDialogVisible] =
    useState(false);
  const showDialog = () => setIsEditTransactionDialogVisible(true);
  const hideDialog = () => setIsEditTransactionDialogVisible(false);

  const {height: deviceHeight} = useWindowDimensions();

  return (
    <>
      {/* TODO: Might want to consider refactoring the dialog into its
      own component. */}
      <Portal>
        <Dialog
          visible={isEditTransactionDialogVisible}
          onDismiss={hideDialog}
          // TODO: It seems the react paper dialog does not respect the
          // safe area view out of the box, which is somewhat expected since the portal
          // renders outside the safe area view. This is a workaround that is okay,
          // but it would be nice to do something more elegant in the future.
          style={{maxHeight: 0.85 * deviceHeight}}>
          <Dialog.Title>
            <View>
              {/* TODO: Add proper styling here, e.g. remove lines from
               the box with the categories and spaces between the title text*/}
              <Text variant="titleLarge">Select a category</Text>
              <Text>{transaction.name}</Text>
            </View>
          </Dialog.Title>
          <Dialog.ScrollArea>
            <CategoryList
              onItemPress={(category: string) => {
                storeTransactionToCategoryMap({
                  transactionIdToCategoryMapping: {[transaction.id]: category},
                  source: transaction.source
                });
                hideDialog();
              }}
            />
          </Dialog.ScrollArea>
        </Dialog>
      </Portal>
      {/* TODO: Show something like a green checkmark or error 
      after the new mapping has been stored. */}
      <List.Item
        title={transaction.name}
        // TODO: Show the mapped transaction name here
        description={createDescriptionString(transaction)}
        left={() =>
          ListIcon(
            categoryMap[transaction.category] ??
              INITIAL_CATEGORY_MAP[Category.UNKNOWN]
          )
        }
        right={() =>
          RightText(
            Math.round((transaction.amount + Number.EPSILON) * 100) / 100
          )
        }
        onPress={showDialog}
        style={styles.item}
      />
    </>
  );
};

const styles = StyleSheet.create({
  item: {paddingHorizontal: 10}
});

export default Transaction;
