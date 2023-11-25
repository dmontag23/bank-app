import React, {useCallback} from "react";
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import {Text} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const ITEM_HEIGHT = 74;
const GAP_BETWEEN_ITEMS = 30;

type ScrollableIconListProps = {
  icons: string[];
  onIconPress?: (iconName: string) => void;
};

const ScrollableIconList = ({
  icons,
  onIconPress = () => {}
}: ScrollableIconListProps) => {
  // useCallback is used here for performance reasons
  const renderItem: ListRenderItem<string> = useCallback(
    ({item: iconName}) => (
      <TouchableOpacity
        key={iconName}
        style={styles.icon}
        onPress={() => onIconPress(iconName)}>
        <MaterialCommunityIcons name={iconName} size={30} />
        <Text>{iconName}</Text>
      </TouchableOpacity>
    ),
    [onIconPress]
  );

  // if the performance of this component becomes slow, it can be optimized
  // by following https://reactnative.dev/docs/optimizing-flatlist-configuration
  return icons.length ? (
    <FlatList
      accessibilityLabel="Icon list"
      data={icons}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT + GAP_BETWEEN_ITEMS,
        offset: (ITEM_HEIGHT + GAP_BETWEEN_ITEMS) * index,
        index
      })}
      numColumns={2}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  ) : (
    <Text variant="titleMedium" style={styles.noIconText}>
      No icons found
    </Text>
  );
};

export default ScrollableIconList;

const styles = StyleSheet.create({
  container: {rowGap: GAP_BETWEEN_ITEMS},
  icon: {width: "50%", height: ITEM_HEIGHT, alignItems: "center", rowGap: 10},
  noIconText: {alignSelf: "center"}
});
