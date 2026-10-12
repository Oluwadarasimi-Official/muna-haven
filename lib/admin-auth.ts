/**
 * Owner login mapping: USERNAME → synthetic email.
 *
 * The owner signs in with a username (e.g. "OfficialMuna"), not an email.
 * We normalize the username and derive a synthetic internal email address
 * that only exists inside the auth system — it must NEVER appear in UI,
 * labels, placeholders, or error messages.
 */
export const OWNER_USERNAME = "OfficialMuna";

const SYNTHETIC_EMAIL_DOMAIN = "munas-haven.internal";

export function usernameToEmail(username: string): string {
  const normalized = username.trim().toLowerCase();
  return `${normalized}@${SYNTHETIC_EMAIL_DOMAIN}`;
}
