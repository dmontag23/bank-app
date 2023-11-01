import React from "react";
import {StyleSheet, View} from "react-native";
import {Divider, Text} from "react-native-paper";

import {useAppTheme} from "../../hooks/utils/useAppTheme";
import {AppError} from "../../types/errors";
import ExpandableAccordion from "../ui/ExpandableAccordion";

type ErrorItemProps = {
  error: AppError;
  isSelected: boolean;
};

const ErrorItem = ({error, isSelected}: ErrorItemProps) => {
  const theme = useAppTheme();
  return (
    <View style={styles.container}>
      <ExpandableAccordion
        title={`Error: ${error.error}`}
        isInitiallyExpanded={isSelected}
        icon="exclamation-thick"
        unselectedColor={theme.colors.onErrorContainer}
        selectedColor={theme.colors.error}>
        <Text
          variant="bodyLarge"
          style={[styles.text, {color: theme.colors.onErrorContainer}]}>
          Error details:
        </Text>
        <Text>{JSON.stringify(error, null, 4)}</Text>
      </ExpandableAccordion>
      <Divider
        theme={{colors: {outlineVariant: theme.colors.onErrorContainer}}}
        testID="error-item-divider"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {rowGap: 10},
  text: {paddingBottom: 10}
});

export default ErrorItem;
