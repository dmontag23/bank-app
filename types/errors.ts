export type AppError = {
  id: string;
  error: string;
  errorMessage?: string;
  service?: string;
  status?: number;
  url?: string;
};
