import { writeSessionIdleCookie } from "./sessionIdleCookie";

/**
 * Stores session expiration and idle timeout information in `localStorage`
 * based on the backend login response.
 *
 * The backend sets the JWT in an HTTP-only cookie, so the frontend does not
 * receive or store the token directly. Instead, it uses the provided `expires_at`
 * timestamp to track when the session should expire.
 *
 * @param data - Object containing session-related values returned by the backend.
 * @param data.expires_at - ISO 8601 timestamp indicating when the session expires.
 * @param data.idle_timeout_minutes - (Optional) Allowed idle time (in minutes) before forcing logout.
 *
 * @example
 * initSessionStorageFromSessionResponse({
 *   expires_at: "2025-11-09T16:42:54Z",
 *   idle_timeout_minutes: 15,
 * });
 */
export function initSessionStorageFromSessionResponse({
  expires_at,
  idle_timeout_minutes,
}: {
  expires_at: string;
  idle_timeout_minutes?: number;
}): void {
  const idleMinutes =
    typeof idle_timeout_minutes === "number" ? idle_timeout_minutes : 0.3;

  // Opcional: mantener localStorage por compatibilidad
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("userTokenExpiresAt", expires_at);
    localStorage.setItem("userIdleTimeout", idleMinutes.toString());
  }

  const now = Date.now();

  writeSessionIdleCookie({
    expires_at,
    idle_timeout_minutes: idleMinutes,
    last_activity_at: now,
  });
}