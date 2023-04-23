import React, {ReactNode, useState} from "react";
import {LayoutAnimation, StyleSheet} from "react-native";
import {List, useTheme} from "react-native-paper";

type ExpandableAccordionProps = {
  title: string;
  children: ReactNode;
};

const ExpandableAccordion = ({title, children}: ExpandableAccordionProps) => {
  const theme = useTheme();

  const [isAccordionExpanded, setIsAccordionExpanded] = useState(true);

  return (
    <List.Accordion
      title={title}
      onPress={() => {
        LayoutAnimation.easeInEaseOut();
        setIsAccordionExpanded(isExpanded => !isExpanded);
      }}
      expanded={isAccordionExpanded}
      style={styles.accordionHeader}
      theme={{colors: {background: theme.colors.elevation.level0}}}>
      {children}
    </List.Accordion>
  );
};

const styles = StyleSheet.create({
  accordionHeader: {paddingLeft: 0}
});

export default ExpandableAccordion;
