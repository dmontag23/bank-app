import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {getTokenFromStorage} from "./utils";

describe("getTokenFromStorage", () => {
  test("gets the item correctly", async () => {
    await AsyncStorage.setItem("test-token", "a cool token");
    expect(await getTokenFromStorage("test-token")).toBe("a cool token");
  });

  test("returns rejection on AsyncStorage failure", async () => {
    (
      AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>
    ).mockRejectedValueOnce("Error with getItem");

    await expect(getTokenFromStorage("test-token")).rejects.toEqual({
      name: "Cannot fetch AsyncStorage test-token token",
      message:
        "An error occurred when trying to fetch the token from storage: Error with getItem"
    });
  });
});
