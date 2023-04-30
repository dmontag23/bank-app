import React from "react";
import {ScrollView} from "react-native";
import {List} from "react-native-paper";
import {StyleProp, ViewStyle} from "react-native/types";

import {TransactionCategory} from "../../types/transaction";

// TODO: Map the categories to different icons
const ListIcon = (props: {color: string; style: StyleProp<ViewStyle>}) => (
  <List.Icon {...props} icon="folder" />
);

type CategoryListProps = {
  onItemPress?: (category: TransactionCategory) => void;
};

const CategoryList = ({onItemPress}: CategoryListProps) => (
  <ScrollView>
    {Object.keys(TransactionCategory).map((category, i) => (
      <List.Item
        key={i}
        // TODO: Properly map these categories to names
        title={category}
        left={props => ListIcon(props)}
        onPress={() => {
          onItemPress &&
            onItemPress(
              TransactionCategory[category as keyof typeof TransactionCategory]
            );
        }}
      />
    ))}
  </ScrollView>
);

export default CategoryList;
