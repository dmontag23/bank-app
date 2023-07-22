import React from "react";
import {describe, expect, jest, test} from "@jest/globals";
import {render} from "@testing-library/react-native";

import App from "./App";
import Screens from "./components/Scenes";

jest.mock("./components/Scenes");

describe("App component", () => {
  test("renders correctly", () => {
    render(<App />);

    expect(Screens).toBeCalledTimes(1);
    expect(Screens).toBeCalledWith({}, {});
  });
});
