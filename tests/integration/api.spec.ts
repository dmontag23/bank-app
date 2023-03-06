import {trueLayerAuthApi, trueLayerDataApi} from "../../axiosConfig";
import {AuthAPIErrorResponse} from "../../types/trueLayer/authAPI/serverResponse";
import {
  DataAPIErrorResponse,
  DataAPISuccessResponse
} from "../../types/trueLayer/dataAPI/serverResponse";

describe("TrueLayer", () => {
  describe("Auth API", () => {
    type Response =
      | {
          requestHeaders: Record<string, string>;
          url?: URL;
        }
      | AuthAPIErrorResponse;
    test("returns a resource successfully", async () => {
      await expect(
        trueLayerAuthApi.get<Response>("/dummy/200")
      ).resolves.toBeTruthy();
    });

    test("handles an error from the server correctly", async () => {
      await expect(
        trueLayerAuthApi.get<Response>("/dummy/401")
      ).rejects.toBeTruthy();
    });

    test("handles a network error correctly", async () => {
      await expect(
        trueLayerAuthApi.get<Response>("/dummy/network-error")
      ).rejects.toBeTruthy();
    });
  });

  describe("Data API", () => {
    type Response = DataAPISuccessResponse<
      | {
          requestHeaders: Record<string, string>;
          url?: URL;
        }
      | DataAPIErrorResponse
    >;
    test("returns a resource successfully", async () => {
      await expect(
        trueLayerDataApi.get<Response>("/dummy/200")
      ).resolves.toBeTruthy();
    });

    test("handles an error from the server correctly", async () => {
      await expect(
        trueLayerDataApi.get<Response>("/dummy/401")
      ).rejects.toBeTruthy();
    });

    test("handles a network error correctly", async () => {
      await expect(
        trueLayerDataApi.get<Response>("/dummy/network-error")
      ).rejects.toBeTruthy();
    });
  });
});
