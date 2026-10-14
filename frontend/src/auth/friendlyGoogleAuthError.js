/** Customer-facing messages for failed Google authentication.
 * Do not expose Firebase configuration, Firestore paths, internal codes or
 * instructions for fixing the site's backend on public login screens.
 */
export function friendlyGoogleAuthError(error) {
  switch (error?.code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Google sign-in could not open. Please allow pop-ups and try again.';
    case 'auth/email-not-verified':
      return 'Please verify your email before signing in.';
    case 'auth/admin-profile-missing':
    case 'auth/not-admin':
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'Unauthorized. This account does not have administrator access.';
    case 'auth/network-request-failed':
    case 'unavailable':
      return 'Connection problem. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/account-exists-with-different-credential':
    case 'auth/credential-already-in-use':
      return 'This Google account is already linked to another sign-in.';
    case 'auth/firebase-not-configured':
    case 'auth/google-not-configured':
    case 'auth/unauthorized-domain':
    case 'auth/operation-not-allowed':
      return 'Google sign-in is currently unavailable. Please try again later.';
    default:
      return 'Google sign-in failed. Please try again.';
  }
}
