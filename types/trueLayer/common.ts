import {AuthAPIErrorResponse} from "./authAPI/serverResponse";
import {DataAPIErrorResponse} from "./dataAPI/serverResponse";

type ErrorDetails = Record<string, string>;

export type CommonAPIErrorResponse = {
  error: string;
  error_description?: string;
  error_details?: ErrorDetails;
};

// the auth api and the data api both have a common error
// structure that they can return
// the structure of this error is only different in that the
// auth api has specific enum values for the "error" field
export const isCommonTruelayerAPIError = (
  response: AuthAPIErrorResponse | DataAPIErrorResponse
): response is CommonAPIErrorResponse =>
  (response as CommonAPIErrorResponse)?.error !== undefined;
