import React, {useContext} from "react";
import {StyleSheet, View} from "react-native";
import {Badge, Divider, List, Surface, Text} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {MaterialBottomTabScreenProps} from "@react-navigation/material-bottom-tabs";
import {CompositeScreenProps} from "@react-navigation/native";
import {StackScreenProps} from "@react-navigation/stack";

import {useAppTheme} from "../../hooks/utils/useAppTheme";
import AddCategoryContext from "../../store/add-category-context";
import ErrorContext from "../../store/error-context";
import {AppError} from "../../types/errors";
import {LoggedInTabParamList, RootStackParamList} from "../../types/screens";

const createRightListIcons = (errors?: AppError[]) => (
  <View style={styles.rightListItems}>
    {errors?.length ? (
      <Badge size={25}>{errors.length.toString()}</Badge>
    ) : (
      <></>
    )}
    <List.Icon icon="chevron-right" />
  </View>
);

const SettingsScreen = ({
  navigation
}: CompositeScreenProps<
  MaterialBottomTabScreenProps<LoggedInTabParamList, "Settings">,
  StackScreenProps<RootStackParamList>
>) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const {errorModal, errors} = useContext(ErrorContext);
  const {showModal} = useContext(AddCategoryContext);

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <Text variant="displaySmall" style={styles.titleText}>
        Settings
      </Text>
      {/* The surface is needed to set the background color
      so that it works with the ripple color */}
      {/* TODO: Refactor the surface and list items below into a common
      component */}
      <View style={styles.contentContainer}>
        <Surface
          mode="flat"
          style={[
            styles.item,
            {backgroundColor: theme.colors.secondaryContainer}
          ]}>
          <List.Item
            title="Add category"
            onPress={showModal}
            right={() => createRightListIcons()}
            style={styles.item}
            rippleColor={theme.colors.surfaceVariant}
          />
        </Surface>
        <Surface
          mode="flat"
          style={[
            styles.item,
            {backgroundColor: theme.colors.secondaryContainer}
          ]}>
          <List.Item
            title="Reconnect to Truelayer"
            onPress={() => navigation.replace("TruelayerWebAuth")}
            right={() => createRightListIcons()}
            style={styles.item}
            rippleColor={theme.colors.surfaceVariant}
          />
          <Divider />
          <List.Item
            title="Show Errors"
            onPress={() => errorModal.showModal()}
            right={() => createRightListIcons(errors)}
            style={styles.item}
            rippleColor={theme.colors.surfaceVariant}
          />
        </Surface>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingHorizontal: 10},
  contentContainer: {rowGap: 30},
  item: {borderRadius: 10},
  rightListItems: {flexDirection: "row", columnGap: 10},
  titleText: {marginVertical: 20, textAlign: "center"}
});

export default SettingsScreen;
