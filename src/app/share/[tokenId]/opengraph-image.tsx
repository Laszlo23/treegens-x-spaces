import { ImageResponse } from "next/og";
import { appNetworkDescription } from "@/config/chain";
import { fetchMetadataForToken } from "@/lib/server-token";

export const runtime = "nodejs";
export const alt = "Voice Seed artifact";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: { tokenId: string } };

export default async function Image(props: Props) {
  const { tokenId } = props.params;
  let meta = null;
  try {
    meta = await fetchMetadataForToken(BigInt(tokenId));
  } catch {
    meta = null;
  }

  const speaker =
    meta?.attributes?.find((a) => a.trait_type === "Speaker")?.value || "Speaker";
  const quote =
    meta?.attributes?.find((a) => a.trait_type === "Quote")?.value?.slice(0, 160) ||
    meta?.description?.slice(0, 160) ||
    "Collectible voice moment on Base.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 56,
          background: "linear-gradient(145deg, #020617 0%, #2a3218 45%, #141a0d 100%)",
          color: "#ecfdf5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "radial-gradient(circle at 30% 30%, #d5e26b, #3d4620)",
              boxShadow: "0 0 40px rgba(213,226,107,0.45)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 14, letterSpacing: "0.35em", color: "#d5e26b" }}>
              TREEGENS
            </span>
            <span style={{ fontSize: 36, fontWeight: 700 }}>Voice Seed</span>
          </div>
        </div>
        <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 20 }}>{speaker}</div>
        <div
          style={{
            fontSize: 26,
            fontStyle: "italic",
            opacity: 0.92,
            maxWidth: 900,
            lineHeight: 1.35,
            borderLeft: "4px solid rgba(213,226,107,0.65)",
            paddingLeft: 24,
          }}
        >
          “{quote}”
        </div>
        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 20,
            color: "#dce8a8",
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "2px solid #d5e26b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            ▶
          </span>
          <span>Tap play on the share page · {appNetworkDescription()}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
