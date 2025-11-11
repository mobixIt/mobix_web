export interface ApiErrorDetail {
  code: string;
  title: string;
  detail: string;
}

export interface ApiErrorResponse {
  errors: ApiErrorDetail[];
}

export interface ApiSuccessResponse<T> {
  data: T;
}