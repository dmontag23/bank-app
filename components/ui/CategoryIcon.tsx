import React from "react";
import {Avatar} from "react-native-paper";
import {IconSource} from "react-native-paper/lib/typescript/src/components/Icon";

type CategoryIconProps = {
  icon: IconSource;
  color: string;
};

const CategoryIcon = ({icon, color}: CategoryIconProps) => (
  <Avatar.Icon
    color="white"
    size={32}
    icon={icon}
    style={{backgroundColor: color}}
    testID="category-avatar"
  />
);

export default CategoryIcon;
