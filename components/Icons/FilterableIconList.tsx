import React, {useState} from "react";
import {StyleSheet} from "react-native";
import {TextInput} from "react-native-paper";
import MaterialCommunityIconsGlyphs from "react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json";

import ScrollableIconList from "./ScrollableIconList";

const SUPPORTED_ICONS = Object.keys(MaterialCommunityIconsGlyphs);

type FilterableIconListProps = {
  onIconPress?: (iconName: string) => void;
};

const FilterableIconList = ({onIconPress}: FilterableIconListProps) => {
  const [iconName, setIconName] = useState("");
  const trimmedIconName = iconName.trim().toLowerCase();

  return (
    <>
      <TextInput
        accessibilityLabel="Search for an icon"
        mode="outlined"
        placeholder="Search for an icon"
        value={iconName}
        onChangeText={setIconName}
        style={styles.textInput}
      />
      <ScrollableIconList
        icons={SUPPORTED_ICONS.filter(icon => icon.includes(trimmedIconName))}
        onIconPress={onIconPress}
      />
    </>
  );
};

export default FilterableIconList;

const styles = StyleSheet.create({
  textInput: {height: 30, marginBottom: 20}
});
