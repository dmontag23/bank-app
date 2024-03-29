import React from "react";
import {ScrollView} from "react-native";
import {List} from "react-native-paper";
import {IconSource} from "react-native-paper/lib/typescript/components/Icon";

import useGetCategoryMap from "../../hooks/transactions/useGetCategoryMap";
import CategoryIcon from "../ui/CategoryIcon";
import LoadingSpinner from "../ui/LoadingSpinner";

const ListIcon = ({icon, color}: {icon: IconSource; color: string}) => (
  <CategoryIcon icon={icon} color={color} />
);

type CategoryListProps = {
  onItemPress?: (category: string) => void;
};

const CategoryList = ({onItemPress}: CategoryListProps) => {
  const {isLoading, data: categories} = useGetCategoryMap();
  if (isLoading) return <LoadingSpinner />;
  const categoryMap = categories ?? {};
  return (
    <ScrollView testID="categoryListScrollView">
      {Object.keys(categoryMap)
        .sort()
        .map((category, i) => (
          <List.Item
            key={i}
            title={category}
            left={() => ListIcon(categoryMap[category])}
            onPress={() => {
              onItemPress && onItemPress(category);
            }}
          />
        ))}
    </ScrollView>
  );
};

export default CategoryList;
