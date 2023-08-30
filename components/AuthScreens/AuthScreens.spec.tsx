import React from "react";
import {act, render} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import {NavigationContainer} from "@react-navigation/native";

import AuthScreens from "./AuthScreens";
import ThirdPartyConnections from "./ThirdPartyConnections";
import TruelayerAuthValidation from "./Truelayer/TruelayerAuthValidation";
import TruelayerWebAuth from "./Truelayer/TruelayerWebAuth";

jest.mock("./ThirdPartyConnections");
jest.mock("./Truelayer/TruelayerAuthValidation");
jest.mock("./Truelayer/TruelayerWebAuth");

describe("AuthScreens component", () => {
  test("renders all screens correctly", async () => {
    render(
      <NavigationContainer>
        <AuthScreens />
      </NavigationContainer>
    );
    expect(ThirdPartyConnections).toBeCalledTimes(1);

    // navigate to other screens
    const navigation = (
      ThirdPartyConnections as jest.MockedFunction<typeof ThirdPartyConnections>
    ).mock.calls[0][0].navigation;

    act(() => navigation.navigate("TruelayerWebAuth"));
    expect(TruelayerWebAuth).toBeCalledTimes(1);

    act(() =>
      navigation.navigate("TruelayerAuthValidation", {error: "access_denied"})
    );
    expect(TruelayerAuthValidation).toBeCalledTimes(1);
  });
});
