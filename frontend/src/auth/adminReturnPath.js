// Cosmetic return-path storage, not a security mechanism. ProtectedRoute and
// server-side Firestore rules still enforce administrator authorization.
const allowedAdminPaths = new Set([
  '/admin/dashboard', '/admin/farmers', '/admin/devices',
  '/admin/reports', '/admin/activity', '/admin/settings',
]);
const SESSION_KEY = 'soilsense:last-admin-page';

export function rememberAdminPath(path) {
  if (allowedAdminPaths.has(path)) {
    try { sessionStorage.setItem(SESSION_KEY, path); } catch { /* Storage is optional. */ }
  }
}

export function getAdminReturnPath() {
  try {
    const path = sessionStorage.getItem(SESSION_KEY);
    if (allowedAdminPaths.has(path)) return path;
  } catch { /* Storage may be blocked by the browser. */ }
  return '/admin/dashboard';
}

export function clearAdminReturnPath() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Ignore. */ }
}
