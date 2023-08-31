import React, {useContext} from "react";
import {ScrollView, StyleSheet} from "react-native";
import {Button, Modal, Portal, Text, useTheme} from "react-native-paper";

import ErrorItem from "./ErrorItem";

import ErrorContext from "../../store/error-context";

const ErrorModal = () => {
  const theme = useTheme();
  const {errorModal, errors} = useContext(ErrorContext);

  return (
    <Portal>
      <Modal
        visible={errorModal.isVisible}
        onDismiss={errorModal.hideModal}
        style={styles.modalContainer}
        contentContainerStyle={[
          styles.modalContentContainer,
          {backgroundColor: theme.colors.errorContainer}
        ]}>
        <Text
          variant="displaySmall"
          style={[styles.text, {color: theme.colors.onErrorContainer}]}>
          Errors
        </Text>
        {errors.length ? (
          <ScrollView>
            {errors.map(error => (
              <ErrorItem
                key={error.id}
                error={error}
                isSelected={error.id === errorModal.selectedErrorId}
              />
            ))}
          </ScrollView>
        ) : (
          <Text variant="bodyLarge" style={styles.text}>
            No detected errors in the app 🥳
          </Text>
        )}
        <Button
          mode="contained"
          onPress={errorModal.hideModal}
          buttonColor={theme.colors.onErrorContainer}
          style={styles.closeButton}>
          Close
        </Button>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  closeButton: {marginHorizontal: 100},
  modalContainer: {paddingTop: 30, paddingBottom: 100, marginHorizontal: 15},
  modalContentContainer: {
    padding: 10,
    borderRadius: 30,
    rowGap: 20
  },
  text: {alignSelf: "center"}
});

export default ErrorModal;
