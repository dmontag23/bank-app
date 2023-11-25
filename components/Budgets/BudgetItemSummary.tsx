import React, {useState} from "react";
import {StyleSheet, View} from "react-native";
import {Chip, IconButton, ProgressBar, Text} from "react-native-paper";

import BudgetDialog from "./BudgetDialog";

import {INITIAL_CATEGORY_MAP} from "../../constants";
import {useAppTheme} from "../../hooks/utils/useAppTheme";
import {Budget, BudgetItemWithTransactions} from "../../types/budget";
import {CategoryMap} from "../../types/transaction";
import CategoryIcon from "../ui/CategoryIcon";
import ExpandableAccordion from "../ui/ExpandableAccordion";

type BudgetItemSummaryProps = {
  item: BudgetItemWithTransactions;
  budget: Budget;
  setSelectedBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
  categoryMap: CategoryMap;
};

const BudgetItemSummary = ({
  item,
  budget,
  setSelectedBudget,
  categoryMap
}: BudgetItemSummaryProps) => {
  const theme = useAppTheme();

  const [isBudgetDialogVisible, setIsBudgetDialogVisible] = useState(false);
  const showBudgetDialog = () => setIsBudgetDialogVisible(true);
  const hideBudgetDialog = () => setIsBudgetDialogVisible(false);

  const amtLeft = item.cap - item.spent;
  const percentLeft = item.cap !== 0 ? amtLeft / item.cap : 0;

  return (
    <>
      <BudgetDialog
        isVisible={isBudgetDialogVisible}
        hide={hideBudgetDialog}
        setSelectedBudget={setSelectedBudget}
        isEditing={true}
        formValues={budget}
      />
      <View style={styles.titleContainer}>
        {/* This view is here to pad the left side of the screen to ensure that the title
        is centered and the edit button is on the right hand side of the title */}
        <View style={styles.titleSideItems} />
        <Text variant="displayMedium" style={styles.title}>
          {item.name}
        </Text>
        <View style={styles.titleSideItems}>
          <IconButton
            accessibilityLabel="Edit budget"
            icon="pencil"
            mode="contained-tonal"
            size={20}
            onPress={showBudgetDialog}
          />
        </View>
      </View>
      <View style={styles.amountsContainer}>
        <View style={styles.amountsTextContainer}>
          <Text variant="displayMedium">
            {/* TODO: Make the currency dynamic, also might want to consider
            toLocaleString instead of toFixed to avoid rounding issues with toFixed */}
            £{(Math.round((amtLeft + Number.EPSILON) * 100) / 100).toFixed(2)}
          </Text>
          <Text variant="labelLarge">left of £{item.cap.toFixed(2)}</Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <ProgressBar
          progress={percentLeft > 0 ? percentLeft : 0}
          style={[
            styles.progressBar,
            {
              backgroundColor:
                percentLeft < 0
                  ? theme.colors.errorContainer
                  : theme.colors.primaryContainer
            },
            ...(percentLeft < 0
              ? [{borderColor: theme.colors.error, borderWidth: 1}]
              : [])
          ]}
          testID="budgetItemSummaryProgressBar"
        />
      </View>
      <ExpandableAccordion title="Categories" headerStyle={styles.accordion}>
        <View style={styles.categoriesContainer}>
          {item.categories.map(category => {
            const isCategoryInMap = Boolean(categoryMap[category]);
            const {icon, color} = isCategoryInMap
              ? categoryMap[category]
              : INITIAL_CATEGORY_MAP.Unknown;
            return (
              <Chip
                key={category}
                avatar={<CategoryIcon icon={icon} color={color} />}
                textStyle={styles.categoryChip}
                style={{backgroundColor: color}}>
                {isCategoryInMap ? category : "Unknown"}
              </Chip>
            );
          })}
        </View>
      </ExpandableAccordion>
    </>
  );
};

const styles = StyleSheet.create({
  accordion: {width: "80%", alignSelf: "center"},
  amountsContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10
  },
  amountsTextContainer: {alignItems: "flex-end"},
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingLeft: "12%",
    paddingRight: "10%"
  },
  categoryChip: {fontSize: 11, color: "white"},
  progressBarContainer: {justifyContent: "center", marginBottom: 10},
  progressBar: {width: "80%", height: 20, borderRadius: 8, alignSelf: "center"},
  titleContainer: {flexDirection: "row", justifyContent: "center"},
  titleSideItems: {justifyContent: "center", paddingLeft: 15},
  title: {textAlign: "center", textAlignVertical: "center"}
});

export default BudgetItemSummary;
