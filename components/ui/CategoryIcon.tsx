import React from "react";
import {Avatar} from "react-native-paper";

import {TransactionCategory} from "../../types/transaction";

type CategoryToIconMap = Record<string, {icon: string; color: string}>;

const categoryToIconMap: CategoryToIconMap = {
  [TransactionCategory.BILLS]: {icon: "card-text-outline", color: "red"},
  [TransactionCategory.EATING_OUT]: {icon: "food-fork-drink", color: "orange"},
  [TransactionCategory.ENTERTAINMENT]: {
    icon: "movie-open-outline",
    color: "blue"
  },
  [TransactionCategory.SAVINGS]: {icon: "cash-lock", color: "green"},
  [TransactionCategory.UNKNOWN]: {icon: "head-question", color: "grey"}
};

type CategoryIconProps = {
  category: TransactionCategory;
};

const CategoryIcon = ({category}: CategoryIconProps) => {
  const {color, icon} = categoryToIconMap[category];
  return (
    <Avatar.Icon
      color="white"
      size={32}
      icon={icon}
      style={{backgroundColor: color}}
      testID={"category-avatar"}
    />
  );
};

export default CategoryIcon;
