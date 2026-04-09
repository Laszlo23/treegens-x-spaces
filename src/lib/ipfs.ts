/**
 * Client helpers for server-side IPFS pinning routes (keys stay on the server).
 */

export async function uploadAudioToIpfs(file: File): Promise<{ cid: string; gatewayUrl: string }> {
  const fd = new FormData();
  fd.append("file", file, file.name || "moment.wav");
  const res = await fetch("/api/ipfs/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<{ cid: string; gatewayUrl: string }>;
}

export async function uploadJsonToIpfs(
  body: Record<string, unknown>,
  name = "metadata.json"
): Promise<{ cid: string; gatewayUrl: string; ipfsUri: string }> {
  const res = await fetch("/api/ipfs/json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body, name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<{ cid: string; gatewayUrl: string; ipfsUri: string }>;
}

export function defaultGateway(): string {
  return (
    process.env.NEXT_PUBLIC_IPFS_GATEWAY?.replace(/\/$/, "") ||
    "https://gateway.pinata.cloud/ipfs"
  );
}

export function cidToHttp(cid: string): string {
  return `${defaultGateway()}/${cid}`;
}

/** Resolve tokenURI (ipfs:// or https) to a fetchable HTTP URL for browsers / server. */
export function tokenUriToHttp(uri: string): string {
  const g = defaultGateway().replace(/\/$/, "");
  if (uri.startsWith("ipfs://")) {
    const path = uri.replace(/^ipfs:\/\//, "").replace(/^ipfs\//, "");
    return `${g}/${path}`;
  }
  return uri;
}
