import React, {useContext, useEffect} from "react";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {StyleSheet, useWindowDimensions, View} from "react-native";
import {Button, Dialog, Portal, Text, TextInput} from "react-native-paper";

import useStoreCategoryMap from "../../hooks/transactions/useStoreCategoryMap";
import {useAppTheme} from "../../hooks/utils/useAppTheme";
import AddCategoryContext from "../../store/add-category-context";
import {CategoryAssociations} from "../../types/transaction";
import ColorPicker from "../ColorPicker/ColorPicker";
import FilterableIconList from "../Icons/FilterableIconList";

type FormValues = {
  categoryName: string;
} & CategoryAssociations;

const AddCategory = () => {
  const theme = useAppTheme();
  const {height: deviceHeight} = useWindowDimensions();
  const {isVisible, hideModal} = useContext(AddCategoryContext);
  const {mutate: storeCategory} = useStoreCategoryMap();

  const {
    control,
    handleSubmit,
    formState: {isSubmitSuccessful},
    reset,
    watch
  } = useForm<FormValues>({
    defaultValues: {
      categoryName: "",
      icon: "",
      color: "hsl(0, 100%, 50%)"
    }
  });

  useEffect(() => {
    if (isSubmitSuccessful) reset();
  }, [isSubmitSuccessful, reset]);

  const onSubmit: SubmitHandler<FormValues> = ({categoryName, icon, color}) =>
    storeCategory({[categoryName]: {icon, color}});

  // TODO: Add validation to the form
  return (
    <Portal>
      <Dialog
        dismissable={false}
        visible={isVisible}
        onDismiss={hideModal}
        // TODO: It seems the react paper dialog does not respect the
        // safe area view out of the box, which is somewhat expected since the portal
        // renders outside the safe area view. This is a workaround that is okay,
        // but it would be nice to do something more elegant in the future.
        style={{maxHeight: 0.9 * deviceHeight}}>
        <Dialog.Title>
          <Text variant="titleLarge">Add category</Text>
        </Dialog.Title>
        <Dialog.ScrollArea style={styles.container}>
          <Controller
            control={control}
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                accessibilityLabel="Category name"
                mode="outlined"
                placeholder="Category name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
              />
            )}
            name="categoryName"
          />
          <View style={styles.iconListContainer}>
            <Controller
              control={control}
              render={({field: {onChange}}) => (
                <FilterableIconList onIconPress={onChange} />
              )}
              name="icon"
            />
          </View>
          <View style={styles.colorWheelContainer}>
            <Controller
              control={control}
              render={({field: {onChange}}) => (
                <ColorPicker
                  iconName={watch("icon")}
                  onColorChange={onChange}
                />
              )}
              name="color"
            />
          </View>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button
            onPress={() => {
              hideModal();
              reset();
            }}
            textColor={theme.colors.error}>
            Cancel
          </Button>
          <Button
            onPress={() => {
              hideModal();
              handleSubmit(onSubmit)();
            }}>
            Save
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default AddCategory;

const styles = StyleSheet.create({
  colorWheelContainer: {flex: 1.25},
  container: {height: "100%", rowGap: 20},
  iconListContainer: {flex: 1},
  input: {height: 30}
});
