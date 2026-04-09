/**
 * Deterministic SVG artwork for Voice Seed & engagement NFT metadata (`image` field).
 * Keeps mints visually distinct without a separate image upload step.
 */

function fnv1a(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Safe text inside SVG (no raw user HTML). */
export function escapeSvgText(s: string, maxLen: number): string {
  const t = s.trim().slice(0, maxLen);
  return t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function initials(speakerName: string): string {
  const parts = speakerName.trim().split(/\s+/).filter(Boolean);
  const w = parts[0] ?? "?";
  if (parts.length > 1) return (parts[0]![0]! + parts[1]![0]!).toUpperCase().slice(0, 2);
  return w.slice(0, 2).toUpperCase();
}

/**
 * Collectible “sonic seed” card: palette + waveform + monogram from speaker & space.
 */
export function buildVoiceSeedImageDataUri(input: { speakerName: string; spaceTitle: string }): string {
  const seed = `${input.speakerName}|${input.spaceTitle}`;
  const h = fnv1a(seed);
  const hueA = h % 72; /* 0–71: bias to yellow-green band */
  const hueB = (h >>> 8) % 72;
  const hue1 = 75 + hueA; /* ~75–147 chartreuse/emerald */
  const hue2 = 130 + (hueB % 40);
  const sat = 42 + (h % 25);
  const mono = escapeSvgText(initials(input.speakerName), 2);
  const ribbon = escapeSvgText(input.spaceTitle || "Space", 36);
  const bars = 11;
  let rects = "";
  const cx = 200;
  const baseY = 240;
  const bw = 10;
  const gap = 4;
  for (let i = 0; i < bars; i++) {
    const jitter = ((h >> (i * 5)) & 0xff) / 255;
    const x = cx - (bars * (bw + gap)) / 2 + i * (bw + gap);
    const bh = 28 + jitter * 72;
    const y = baseY - bh;
    rects += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="2" fill="hsl(${hue1},62%,58%)" opacity="0.92"/>`;
    rects += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="2" fill="none" stroke="hsl(85,70%,85%)" stroke-width="0.5" opacity="0.2"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<defs>
  <radialGradient id="bg" cx="38%" cy="28%" r="75%">
    <stop offset="0%" stop-color="hsl(${hue1},${sat}%,18%)"/>
    <stop offset="55%" stop-color="hsl(${hue2},${Math.min(sat + 8, 85)}%,9%)"/>
    <stop offset="100%" stop-color="#050807"/>
  </radialGradient>
  <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="hsl(${hue1},55%,52%)"/>
    <stop offset="100%" stop-color="hsl(${hue2},40%,32%)"/>
  </linearGradient>
  <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <clipPath id="disc"><circle cx="200" cy="175" r="88"/></clipPath>
</defs>
<rect width="400" height="400" fill="url(#bg)"/>
<circle cx="200" cy="175" r="120" fill="none" stroke="url(#ring)" stroke-width="1.2" opacity="0.35"/>
<circle cx="200" cy="175" r="98" fill="none" stroke="hsl(${hue1},45%,40%)" stroke-width="0.8" opacity="0.5"/>
<g clip-path="url(#disc)" filter="url(#glow)">
  ${rects}
</g>
<circle cx="200" cy="175" r="52" fill="#0a100c" stroke="hsl(${hue1},50%,45%)" stroke-width="2"/>
<text x="200" y="188" text-anchor="middle" fill="hsl(82,45%,78%)" font-family="system-ui,Segoe UI,sans-serif" font-size="28" font-weight="700">${mono}</text>
<rect x="48" y="318" width="304" height="44" rx="10" fill="#0c1210" stroke="hsl(${hue1},35%,28%)" stroke-width="1"/>
<text x="200" y="347" text-anchor="middle" fill="hsl(88,25%,72%)" font-family="system-ui,sans-serif" font-size="13" font-weight="600">${ribbon}</text>
<text x="200" y="32" text-anchor="middle" fill="hsl(${hue1},30%,45%)" font-family="system-ui,sans-serif" font-size="11" letter-spacing="0.35em" font-weight="600">VOICE SEED</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function engagementPalette(rank: number): { a: string; b: string; accent: string } {
  if (rank <= 3) {
    return { a: "#f7e8a8", b: "#8a6a1a", accent: "#fff8e0" };
  }
  if (rank <= 6) {
    return { a: "#c8e8d8", b: "#2a5c48", accent: "#e8fff4" };
  }
  return { a: "#c9b896", b: "#4a3d28", accent: "#f0ebe0" };
}

/**
 * Trophy-style engagement award — rank drives metals and glow.
 */
export function buildEngagementAwardImageDataUri(input: { rank: number; walletAddress: string }): string {
  const { a, b, accent } = engagementPalette(input.rank);
  const tail = input.walletAddress.slice(-4).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<defs>
  <radialGradient id="bg" cx="50%" cy="35%" r="70%">
    <stop offset="0%" stop-color="${a}"/>
    <stop offset="45%" stop-color="${b}"/>
    <stop offset="100%" stop-color="#0f0d08"/>
  </radialGradient>
  <linearGradient id="cup" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="${accent}"/>
    <stop offset="100%" stop-color="${b}"/>
  </linearGradient>
  <filter id="sh"><feGaussianBlur stdDeviation="1.8"/></filter>
</defs>
<rect width="400" height="400" fill="url(#bg)"/>
<path d="M200 52 L248 128 L352 142 L280 218 L298 332 L200 278 L102 332 L120 218 L48 142 L152 128 Z" fill="url(#cup)" stroke="${accent}" stroke-width="1.5" opacity="0.95" filter="url(#sh)"/>
<circle cx="200" cy="188" r="56" fill="#080a07" opacity="0.55"/>
<text x="200" y="212" text-anchor="middle" fill="${accent}" font-family="system-ui,sans-serif" font-size="44" font-weight="800">#${input.rank}</text>
<text x="200" y="62" text-anchor="middle" fill="${accent}" font-family="system-ui,sans-serif" font-size="12" letter-spacing="0.28em" font-weight="700" opacity="0.85">ENGAGEMENT</text>
<rect x="120" y="300" width="160" height="36" rx="8" fill="#0a0c08" stroke="${accent}" stroke-width="0.6" opacity="0.9"/>
<text x="200" y="324" text-anchor="middle" fill="${accent}" font-family="ui-monospace,monospace" font-size="14" font-weight="600">···${tail}</text>
<text x="200" y="372" text-anchor="middle" fill="${accent}" font-family="system-ui,sans-serif" font-size="10" letter-spacing="0.2em" opacity="0.55">TOP COLLECTOR</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
