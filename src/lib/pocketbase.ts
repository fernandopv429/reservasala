import PocketBase from 'pocketbase';

// The URL should be configured via environment variables.
// Defaulting to a local instance for development.
const pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'https://db.nexusdevhub.com';

export const pb = new PocketBase(pbUrl);

/**
 * Helper to get the full profile image URL from PocketBase.
 * If the avatar string is already a full URL (e.g. pravatar), it returns it as is.
 * Otherwise, it constructs the PocketBase file URL.
 */
export function getProfileImageUrl(userId: string, avatarFilename: string) {
  if (!avatarFilename) return '';
  if (avatarFilename.startsWith('http')) return avatarFilename;
  
  // Format: pbUserId/filename
  return `${pbUrl}/api/files/users/${avatarFilename}`;
}
