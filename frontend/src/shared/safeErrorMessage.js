/**
 * User-facing error messages for SoilSense. Never render raw error.message,
 * Firebase codes, server responses, Firestore paths or stack traces in alerts.
 */
export function safeErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const code = typeof error?.code === 'string' ? error.code.toLowerCase() : '';
  const status = Number(error?.status || error?.response?.status || 0);
  if (code === 'permission-denied' || code.endsWith('/permission-denied') || status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (code === 'unauthenticated' || code === 'auth/user-token-expired' || code === 'auth/invalid-user-token' || status === 401) {
    return 'Your session has expired. Please sign in again.';
  }
  if (code === 'unavailable' || code === 'deadline-exceeded' || code === 'auth/network-request-failed' ||
      code === 'network-request-failed' || code === 'network-error' || status === 503 || status === 504 ||
      error?.name === 'NetworkError') {
    return 'Connection problem. Please check your internet and try again.';
  }
  if (code === 'resource-exhausted' || code === 'auth/too-many-requests' || status === 429) {
    return 'Too many requests. Please try again later.';
  }
  // Fallback is a trusted, developer-authored string, not exception content.
  return fallback;
}
