/**
 * Browsers do not store or send cookies with the `Secure` flag on http://.
 * `next start` on a LAN IP is usually http — we must use secure=false there or there is no session cookie.
 *
 * Uses the request URL and `x-forwarded-proto` (TLS-terminating proxies).
 *
 * Optional overrides in `.env.local`:
 * - AUTH_COOKIE_FORCE_SECURE=true → always Secure (rare)
 * - AUTH_COOKIE_INSECURE=true → never Secure (explicit)
 */
export function sessionCookieSecureFromRequest(request) {
  if (process.env.AUTH_COOKIE_FORCE_SECURE === "true") return true;
  if (process.env.AUTH_COOKIE_INSECURE === "true") return false;

  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) {
    const proto = forwarded.split(",")[0]?.trim().toLowerCase();
    if (proto === "https") return true;
    if (proto === "http") return false;
  }

  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}
