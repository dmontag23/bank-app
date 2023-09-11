import React from "react";
import {ScrollView} from "react-native";
import {List} from "react-native-paper";

import {TransactionCategory} from "../../types/transaction";
import CategoryIcon from "../ui/CategoryIcon";

const ListIcon = (category: TransactionCategory) => (
  <CategoryIcon category={category} />
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
        left={() =>
          ListIcon(
            TransactionCategory[category as keyof typeof TransactionCategory]
          )
        }
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
