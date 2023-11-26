import {DataAPIErrorResponse} from "../../../types/trueLayer/dataAPI/serverResponse";

export const ERROR_429_RESPONSE: DataAPIErrorResponse = {
  error_description:
    "Maximum number of requests per user allowed by provider exceeded.",
  error: "provider_request_limit_exceeded",
  error_details: {}
};
