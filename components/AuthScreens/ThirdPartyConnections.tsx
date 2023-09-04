import React, {useContext} from "react";
import {SafeAreaView, StyleSheet} from "react-native";
import {Button, Text} from "react-native-paper";
import {StackScreenProps} from "@react-navigation/stack";

import TruelayerAuthContext from "../../store/truelayer-auth-context";
import {RootStackParamList} from "../../types/screens";

const ThirdPartyConnections = ({
  navigation
}: StackScreenProps<RootStackParamList, "AppViews">) => {
  const {authToken: truelayerAuthToken} = useContext(TruelayerAuthContext);
  return (
    <SafeAreaView style={styles.container}>
      <Text variant="titleMedium">
        Please connect to the following services
      </Text>
      {!truelayerAuthToken && (
        <Button
          mode="elevated"
          onPress={() => navigation.replace("TruelayerWebAuth")}>
          Connect to Truelayer
        </Button>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: "center", alignItems: "center", gap: 30}
});

export default ThirdPartyConnections;
