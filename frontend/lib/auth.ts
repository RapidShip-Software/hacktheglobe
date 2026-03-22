/**
 * Read the logged-in user from the canopy_user cookie (client-side only).
 */
function getCanopyUser(): { email: string; name: string; role: string } | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/canopy_user=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export { getCanopyUser };
