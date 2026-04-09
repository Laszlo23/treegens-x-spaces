import { getPublicBaseUrl } from "@/config/site";

export function sharePageUrl(tokenId: string): string {
  return `${getPublicBaseUrl()}/share/${tokenId}`;
}

export function twitterIntentUrl(opts: { text: string; url: string }): string {
  const params = new URLSearchParams({
    text: opts.text,
    url: opts.url,
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/** Warpcast / Farcaster web compose (share URL + text). */
export function warpcastComposeUrl(opts: { text: string; embeds?: string[] }): string {
  const params = new URLSearchParams({ text: opts.text });
  if (opts.embeds?.length) params.set("embeds[]", opts.embeds[0]!);
  return `https://warpcast.com/~/compose?${params.toString()}`;
}
