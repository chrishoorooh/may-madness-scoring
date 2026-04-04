/** Full navigation so /login always mounts a fresh tree (Safari + BFCache + client router). */
export function goToLogin() {
  if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}

/**
 * Use on `<a href="/login">` so the first tap isn’t a flaky App Router soft navigation
 * (RSC “Load failed” / half-hydrated page). Modifier-clicks keep default browser behavior.
 */
export function goToLoginPageClick(e) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (e.button !== 0) return;
  e.preventDefault();
  window.location.assign("/login");
}
