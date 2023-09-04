import React, {useEffect} from "react";
import {SafeAreaView, StyleSheet} from "react-native";
import {Button, Text} from "react-native-paper";
import type {StackScreenProps} from "@react-navigation/stack";

import usePostTruelayerToken from "../../../hooks/integrations/truelayer/usePostTruelayerToken";
import useStoreTruelayerTokens from "../../../hooks/integrations/truelayer/useStoreTruelayerTokens";
import {RootStackParamList} from "../../../types/screens";
import {
  isAuthAPIErrorResponse,
  isAuthRedirectSuccess
} from "../../../types/trueLayer/authAPI/auth";
import CenteredLoadingSpinner from "../../ui/CenteredLoadingSpinner";

// TODO: Handle error states that can result here
const TruelayerAuthValidation = ({
  navigation,
  route
}: StackScreenProps<RootStackParamList, "TruelayerAuthValidation">) => {
  const {
    mutate: exchangeCodeForAuthTokens,
    isLoading: isPostLoading,
    isIdle: isPostIdle,
    isSuccess: isPostSuccess,
    data: postResponse
  } = usePostTruelayerToken();

  const {
    mutate: storeTruelayerTokens,
    isLoading: isStoreTokensLoading,
    isIdle: isStoreTokensIdle,
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

  useEffect(() => {
    if (isPostSuccess && isStoreTokensSuccess) navigation.replace("AppViews");
  }, [isPostSuccess, isStoreTokensSuccess, navigation]);

  // the (<isIdle> && <success>) conditions here are to ensure
  // the error components still display if there are errors before the
  // mutation calls
  if (
    (isPostIdle && isAuthRedirectSuccess(truelayerResponse)) ||
    isPostLoading ||
    (isStoreTokensIdle && isPostSuccess) ||
    isStoreTokensLoading
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
      <Button mode="elevated" onPress={() => navigation.replace("AppViews")}>
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
