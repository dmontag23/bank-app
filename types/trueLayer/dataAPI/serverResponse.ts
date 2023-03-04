type Status = "Failed" | "Queued" | "Running" | "Succeeded";

export type DataAPISuccessResponse<T> = {
  results: T[];
  status: Status;
};

type ErrorDetails = Record<string, string>;

export type DataAPIErrorResponse = {
  error: string;
  error_description?: string;
  error_details?: ErrorDetails;
};
