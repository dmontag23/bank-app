import React, {ReactNode, useState} from "react";
import {LayoutAnimation, StyleSheet} from "react-native";
import {List, useTheme} from "react-native-paper";
import {IconSource} from "react-native-paper/lib/typescript/src/components/Icon";

const createIcon = (props: {color: string; icon: IconSource}) => (
  <List.Icon {...props} />
);

type ExpandableAccordionProps = {
  title: string;
  children: ReactNode;
  isInitiallyExpanded?: boolean;
  icon?: IconSource;
  unselectedColor?: string;
  selectedColor?: string;
};

const ExpandableAccordion = ({
  title,
  children,
  isInitiallyExpanded = false,
  icon = undefined,
  unselectedColor = undefined,
  selectedColor = undefined
}: ExpandableAccordionProps) => {
  const theme = useTheme();

  const [isAccordionExpanded, setIsAccordionExpanded] =
    useState(isInitiallyExpanded);

  const onSurfaceColor = unselectedColor ?? theme.colors.onSurface;
  const primaryColor = selectedColor ?? theme.colors.primary;

  return (
    <List.Accordion
      title={title}
      titleNumberOfLines={2}
      left={props => icon && createIcon({...props, icon})}
      onPress={() => {
        LayoutAnimation.easeInEaseOut();
        setIsAccordionExpanded(isExpanded => !isExpanded);
      }}
      expanded={isAccordionExpanded}
      style={[styles.accordionHeader]}
      theme={{
        colors: {
          // blend the background color with the container background color
          background: theme.colors.elevation.level0,
          // selected text and icon color
          primary: primaryColor,
          // text color
          onSurface: onSurfaceColor,
          // icon and arrow color
          onSurfaceVariant: onSurfaceColor
        }
      }}>
      {children}
    </List.Accordion>
  );
};

const styles = StyleSheet.create({
  accordionHeader: {paddingLeft: 0}
});

export default ExpandableAccordion;
