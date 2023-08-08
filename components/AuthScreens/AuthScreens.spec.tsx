import React from "react";
import {describe, expect, jest, test} from "@jest/globals";
import {render} from "@testing-library/react-native";

import AuthScreens from "./AuthScreens";
import ThirdPartyConnections from "./ThirdPartyConnections";
import TruelayerAuthValidation from "./Truelayer/TruelayerAuthValidation";
import TruelayerWebAuth from "./Truelayer/TruelayerWebAuth";

import {ComponentTestWrapper} from "../../tests/mocks/utils";

jest.mock("./ThirdPartyConnections");
jest.mock("./Truelayer/TruelayerAuthValidation");
jest.mock("./Truelayer/TruelayerWebAuth");

describe("AuthScreens component", () => {
  test("renders all screens correctly", () => {
    render(<AuthScreens />, {
      wrapper: ComponentTestWrapper
    });
    expect(ThirdPartyConnections).toBeCalledTimes(1);

    // navigate to other screens
    const navigation = (
      ThirdPartyConnections as jest.MockedFunction<typeof ThirdPartyConnections>
    ).mock.calls[0][0].navigation;

    navigation.navigate("TruelayerWebAuth");
    expect(TruelayerWebAuth).toBeCalledTimes(1);

    navigation.navigate("TruelayerAuthValidation", {error: "access_denied"});
    expect(TruelayerAuthValidation).toBeCalledTimes(1);
  });
});
