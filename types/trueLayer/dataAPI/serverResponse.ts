enum Status {
  FAILED = "Failed",
  QUEUED = "Queued",
  RUNNING = "Running",
  SUCCESS = "Succeeded"
}

export type DataAPISuccessResponse<T> = {
  results: T[];
  status: Status;
};

type ErrorDetails = Record<string, string>;

export type DataAPIErrorResponse = {
  error: string;
  error_description: string;
  error_details: ErrorDetails;
};
