import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

export type NormalizedApiError = {
  /** HTTP status code returned by the server, when available. */
  status?: number;

  /** JSON:API `code` field from the backend error (if present). */
  code?: string;

  /** JSON:API `title` field (unmodified, may contain empty strings). */
  title?: string;

  /** JSON:API `detail` field (unmodified, may contain empty strings). */
  detail?: string;

  /**
   * Final normalized message intended for UI display or logging.
   * Selected using priority: detail → title → axios.message → defaultMessage.
   */
  message: string;
};

/**
 * Normalizes a string value by trimming and converting empty strings
 * to `undefined`. Used internally when deciding which error fields
 * provide meaningful information.
 *
 * @param value - The string to normalize.
 * @returns A trimmed string or `undefined` if empty/null.
 */
function normalizeString(value?: string | null): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

type NormalizeApiErrorOptions = {
  /**
   * Default message to use when no meaningful detail/title/message is available.
   * Defaults to `"Unexpected error"`.
   */
  defaultMessage?: string;

  /**
   * When true (default), `axiosErr.message` is considered as a fallback before
   * using the defaultMessage. When false, the Axios message is ignored completely.
   */
  useAxiosMessageAsFallback?: boolean;
};

/**
 * Normalizes an unknown error into a structured `NormalizedApiError`.
 *
 * Behavior:
 * - Extracts HTTP status from Axios error objects.
 * - Reads the first JSON:API error (`errors[0]`) when available.
 * - Cleans detail/title using `normalizeString`, ignoring empty strings.
 * - The final `message` is selected with the following priority:
 *   1. `detail`
 *   2. `title`
 *   3. `axiosErr.message` (only if `useAxiosMessageAsFallback = true`)
 *   4. `defaultMessage`
 *
 * @param error - Any thrown error (Axios or otherwise).
 * @param options - Customization options for fallback behavior.
 * @returns A normalized error object ready for UI or logging.
 */
export function normalizeApiError(
  error: unknown,
  options: NormalizeApiErrorOptions = {},
): NormalizedApiError {
  const {
    defaultMessage = 'Unexpected error',
    useAxiosMessageAsFallback = true,
  } = options;

  const axiosErr = error as AxiosError<ApiErrorResponse>;
  const status = axiosErr.response?.status;
  const firstError = axiosErr.response?.data?.errors?.[0];

  const detail = normalizeString(firstError?.detail);
  const title = normalizeString(firstError?.title);
  const axiosMessage = useAxiosMessageAsFallback
    ? normalizeString(axiosErr.message)
    : undefined;

  const message =
    detail ??
    title ??
    axiosMessage ??
    defaultMessage;

  return {
    status,
    code: firstError?.code,
    title: firstError?.title,
    detail: firstError?.detail,
    message,
  };
}
