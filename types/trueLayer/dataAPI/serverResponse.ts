import {CommonAPIErrorResponse} from "../common";

type Status = "Failed" | "Queued" | "Running" | "Succeeded";

export type DataAPISuccessResponse<T> = {
  results: T[];
  status: Status;
};

type DataAPIErrorResponseWithType = {
  type: string;
  title: string;
  status: number;
  trace_id: string;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
};

export type DataAPIErrorResponse =
  | CommonAPIErrorResponse
  | DataAPIErrorResponseWithType;

// type guard for the data api error response with a type field
export const isDataAPIErrorResponseWithType = (
  response: DataAPIErrorResponse
): response is DataAPIErrorResponseWithType =>
  (response as DataAPIErrorResponseWithType)?.type !== undefined;
