/**
 * Canonical public URL for OG images and share links (set in Vercel to your production domain).
 */
export function getPublicBaseUrl(): string {
  if (typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL.length > 0) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}
