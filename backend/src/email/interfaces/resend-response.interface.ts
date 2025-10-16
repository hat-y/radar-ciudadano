export interface ResendResponse {
  data: {
    id: string;
  } | null;
  error: {
    name: string;
    message: string;
    statusCode?: number;
  } | null;
}
