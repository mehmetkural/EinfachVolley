// Server-side auth guard utilities
// Used in Server Components / middleware to protect routes.
// Firebase Admin SDK can be used here for server-side token verification.
// For now, we rely on client-side auth state managed via Context.

export function getAuthRedirectUrl(destination: string, returnTo?: string): string {
  if (returnTo) {
    return `${destination}?returnTo=${encodeURIComponent(returnTo)}`;
  }
  return destination;
}
