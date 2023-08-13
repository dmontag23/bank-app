import React, {useEffect} from "react";
import {SafeAreaView, StyleSheet} from "react-native";
import {Button, Text} from "react-native-paper";
import type {StackScreenProps} from "@react-navigation/stack";

import usePostTruelayerToken from "../../../hooks/integrations/truelayer/usePostTruelayerToken";
import useStoreTruelayerTokens from "../../../hooks/integrations/truelayer/useStoreTruelayerTokens";
import {TruelayerAuthStackParamList} from "../../../types/screens";
import {
  isAuthAPIErrorResponse,
  isAuthRedirectSuccess
} from "../../../types/trueLayer/authAPI/auth";
import CenteredLoadingSpinner from "../../ui/CenteredLoadingSpinner";

// TODO: Handle error states that can result here
const TruelayerAuthValidation = ({
  navigation,
  route
}: StackScreenProps<
  TruelayerAuthStackParamList,
  "TruelayerAuthValidation"
>) => {
  const {
    mutate: exchangeCodeForAuthTokens,
    isLoading: isPostLoading,
    isSuccess: isPostSuccess,
    data: postResponse
  } = usePostTruelayerToken();

  const {
    mutate: storeTruelayerTokens,
    isLoading: isStoreTokensLoading,
    isSuccess: isStoreTokensSuccess
  } = useStoreTruelayerTokens();

  const truelayerResponse = route.params;

  useEffect(() => {
    if (isAuthRedirectSuccess(truelayerResponse))
      exchangeCodeForAuthTokens(truelayerResponse.code);
  }, [exchangeCodeForAuthTokens, truelayerResponse]);

  useEffect(() => {
    if (isPostSuccess)
      storeTruelayerTokens({
        authToken: postResponse.access_token,
        refreshToken: postResponse.refresh_token ?? ""
      });
  }, [postResponse, isPostSuccess, storeTruelayerTokens]);

  // TODO: This won't work perfectly now as there's going to be a
  // slight jump before the useEffect hooks run. Should probably handle
  // this with a global loading state (maybe?). Maybe a global error state
  // until all hooks resolve and then set that to false?
  if (
    isPostLoading ||
    isStoreTokensLoading ||
    (isPostSuccess && isStoreTokensSuccess)
  )
    return <CenteredLoadingSpinner />;

  return (
    <SafeAreaView style={styles.container}>
      <Text variant="titleLarge" style={styles.errorText}>
        An error has occurred
      </Text>
      <Text variant="titleMedium">
        {isAuthAPIErrorResponse(truelayerResponse)
          ? `Truelayer returned the following error code: ${truelayerResponse.error}`
          : "The error is unknown"}
      </Text>
      <Button
        mode="elevated"
        onPress={() => navigation.replace("TruelayerWebAuth")}>
        Try again
      </Button>
      <Button
        mode="elevated"
        onPress={() => navigation.replace("ThirdPartyConnections")}>
        Return to home screen
      </Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: "center", alignItems: "center", gap: 30},
  errorText: {alignSelf: "center"}
});

export default TruelayerAuthValidation;
