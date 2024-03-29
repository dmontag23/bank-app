import React, {useContext, useState} from "react";
import {StyleSheet} from "react-native";
import {Snackbar} from "react-native-paper";

import {useAppTheme} from "../../hooks/utils/useAppTheme";
import ToastContext, {
  Toast as ToastObjectType,
  ToastType
} from "../../store/toast-context";

type ToastProps = {
  toast: ToastObjectType;
};

const Toast = ({toast}: ToastProps) => {
  const theme = useAppTheme();
  const [visible, setVisible] = useState(true);
  const {clearToast} = useContext(ToastContext);

  const onDismissSnackBar = () => {
    setVisible(false);
    clearToast(toast.id);
  };

  const colorMapping = {
    [ToastType.LOG]: {
      inverseSurface: theme.colors.inverseSurface,
      inverseOnSurface: theme.colors.inverseOnSurface,
      inversePrimary: theme.colors.inversePrimary
    },
    [ToastType.WARNING]: {
      inverseSurface: theme.colors.warningContainer,
      inverseOnSurface: theme.colors.warningOnContainer,
      inversePrimary: theme.colors.warning
    },
    [ToastType.ERROR]: {
      inverseSurface: theme.colors.errorContainer,
      inverseOnSurface: theme.colors.onErrorContainer,
      inversePrimary: theme.colors.error
    }
  };

  return (
    <Snackbar
      theme={{colors: colorMapping[toast.type]}}
      wrapperStyle={styles.wrapper}
      visible={visible}
      onIconPress={onDismissSnackBar}
      onDismiss={onDismissSnackBar}
      action={toast.action}>
      {toast.message}
    </Snackbar>
  );
};

const styles = StyleSheet.create({
  // these styles override the default styles for a snackbar
  // from react-native-paper
  wrapper: {position: "relative", paddingBottom: 0}
});

export default Toast;
