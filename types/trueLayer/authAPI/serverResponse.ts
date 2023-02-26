enum ErrorCategory {
  ACCESS_DENIED = "access_denied",
  INVALID_GRANT = "invalid_grant",
  INVALID_REQUEST = "invalid_request",
  NOT_FOUND = "not_found",
  SERVER_ERROR = "internal_server_error",
  UNAUTHORIZED = "unauthorized",
  UNAUTHORIZED_CLIENT = "unauthorized_client"
}

type ErrorDetails = {reason: string; [key: string]: string};

export type AuthAPIErrorResponse = {
  error: ErrorCategory;
  error_description: string;
  error_details: ErrorDetails;
};
