import React, {useState} from "react";
import {View} from "react-native";
import {Dialog, List, Portal, Text} from "react-native-paper";
import {StyleProp, ViewStyle} from "react-native/types";

import CategoryList from "./CategoryList";

import useStoreTransactionCategoryMap from "../../hooks/useStoreTransactionCategoryMap";
import {
  TransactionCategory,
  Transaction as TransactionType
} from "../../types/transaction";

// TODO: Map categories to different icons
const ListIcon = (props: {color: string; style: StyleProp<ViewStyle>}) => (
  <List.Icon {...props} icon="folder" />
);

const RightText = (amount: number) => (
  <Text variant="titleMedium">{amount}</Text>
);

type TransactionComponentProps = {
  transaction: TransactionType;
};
const Transaction = ({transaction}: TransactionComponentProps) => {
  const {mutate: storeTransactionToCategoryMap} =
    useStoreTransactionCategoryMap();

  const [isEditTransactionDialogVisible, setIsEditTransactionDialogVisible] =
    useState(false);
  const showDialog = () => setIsEditTransactionDialogVisible(true);
  const hideDialog = () => setIsEditTransactionDialogVisible(false);

  return (
    <>
      <Portal>
        <Dialog visible={isEditTransactionDialogVisible} onDismiss={hideDialog}>
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
              onItemPress={(category: TransactionCategory) => {
                storeTransactionToCategoryMap({
                  [transaction.id]: category
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
        description={transaction.category}
        left={props => ListIcon(props)}
        right={() => RightText(transaction.amount)}
        onPress={showDialog}
      />
    </>
  );
};

export default Transaction;