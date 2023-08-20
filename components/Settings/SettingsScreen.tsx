import React, {useContext} from "react";
import {StyleSheet, View} from "react-native";
import {Badge, List, Surface, Text, useTheme} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import ErrorContext from "../../store/error-context";
import {AppError} from "../../types/errors";

const createRightListItems = (errors: AppError[]) => (
  <View style={styles.rightListItems}>
    {errors.length ? (
      <Badge size={25}>{errors.length.toString()}</Badge>
    ) : (
      <></>
    )}
    <List.Icon icon="chevron-right" />
  </View>
);

const SettingsScreen = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {errorModal, errors} = useContext(ErrorContext);

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <Text variant="displaySmall" style={styles.titleText}>
        Settings
      </Text>
      {/* The surface is needed to set the background color
      so that it works with the ripple color */}
      <Surface
        mode="flat"
        style={[
          styles.item,
          {backgroundColor: theme.colors.secondaryContainer}
        ]}>
        <List.Item
          title="Show Errors"
          onPress={() => errorModal.showModal()}
          right={() => createRightListItems(errors)}
          style={styles.item}
          rippleColor={theme.colors.surfaceVariant}
        />
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingHorizontal: 10},
  item: {borderRadius: 10},
  rightListItems: {flexDirection: "row", columnGap: 10},
  titleText: {marginVertical: 20, textAlign: "center"}
});

export default SettingsScreen;
