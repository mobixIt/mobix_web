export function getUserAvatarUrl(identifier?: string): string {
  const seed = identifier && identifier.trim().length > 0
    ? identifier.trim()
    : 'user';

  return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(
    seed,
  )}`;
}