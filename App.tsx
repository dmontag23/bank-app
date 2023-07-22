import React from "react";
import {Portal, useTheme} from "react-native-paper";
import {NavigationContainer} from "@react-navigation/native";

import Screens from "./components/Scenes";

const App = () => {
  const theme = useTheme();

  return (
    <NavigationContainer
      theme={{
        ...theme,
        // TODO: Check these colors to see if they make sense for the react navigation theme
        colors: {
          ...theme.colors,
          card: theme.colors.surface,
          text: theme.colors.background,
          border: theme.colors.surface,
          notification: theme.colors.secondary
        }
      }}>
      <Portal.Host>
        <Screens />
      </Portal.Host>
    </NavigationContainer>
  );
};

export default App;
