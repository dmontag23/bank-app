export type ErrorCategory =
  | "access_denied"
  | "internal_server_error"
  | "invalid_grant"
  | "invalid_request"
  | "not_found"
  | "unauthorized"
  | "unauthorized_client";

type ErrorDetails = {reason?: string} & {[key: string]: string};

export type AuthAPIErrorResponse = {
  error: ErrorCategory;
  error_description?: string;
  error_details?: ErrorDetails;
};
