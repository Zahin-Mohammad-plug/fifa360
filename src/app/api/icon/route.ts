import { NextResponse } from "next/server";

export async function GET(request: Request) {
  let name = "Venue";
  try {
    const url = new URL(request.url);
    name = url.searchParams.get("name") ?? "Venue";
  } catch {
    // malformed URL — fall through with default
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join("");

  const palettes = [
    { bg1: "#040e20", bg2: "#081428", accent1: "#00b4ff", accent2: "#0066ff", text: "#cce8ff" },
    { bg1: "#100820", bg2: "#180e30", accent1: "#7c4dff", accent2: "#a57aff", text: "#e0d8ff" },
    { bg1: "#010e08", bg2: "#031408", accent1: "#00ff88", accent2: "#00c96a", text: "#c8ffec" },
    { bg1: "#100408", bg2: "#1a050c", accent1: "#ff1d78", accent2: "#ff6b9d", text: "#ffd0e4" },
    { bg1: "#0e0a00", bg2: "#160e00", accent1: "#ffd740", accent2: "#ff9100", text: "#fff4cc" },
  ];
  const p = palettes[name.charCodeAt(0) % palettes.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.bg1}"/>
      <stop offset="100%" stop-color="${p.bg2}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.accent1}"/>
      <stop offset="100%" stop-color="${p.accent2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${p.accent1}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${p.accent1}" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur">
      <feGaussianBlur stdDeviation="30"/>
    </filter>
  </defs>

  <rect width="400" height="200" fill="url(#bg)"/>
  <ellipse cx="200" cy="100" rx="190" ry="110" fill="url(#glow)" filter="url(#blur)" opacity="0.7"/>

  <!-- Grid -->
  <g opacity="0.04" stroke="white" stroke-width="1">
    <line x1="0" y1="40" x2="400" y2="40"/>
    <line x1="0" y1="80" x2="400" y2="80"/>
    <line x1="0" y1="120" x2="400" y2="120"/>
    <line x1="0" y1="160" x2="400" y2="160"/>
    <line x1="80" y1="0" x2="80" y2="200"/>
    <line x1="160" y1="0" x2="160" y2="200"/>
    <line x1="240" y1="0" x2="240" y2="200"/>
    <line x1="320" y1="0" x2="320" y2="200"/>
  </g>

  <!-- Rings -->
  <circle cx="200" cy="88" r="50" fill="${p.accent1}" opacity="0.1"/>
  <circle cx="200" cy="88" r="50" fill="none" stroke="${p.accent1}" stroke-width="1.5" opacity="0.35"/>
  <circle cx="200" cy="88" r="64" fill="none" stroke="${p.accent1}" stroke-width="0.75" opacity="0.15"/>

  <!-- Initials -->
  <text x="200" y="100" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui,-apple-system,BlinkMacSystemFont,sans-serif"
        font-weight="900" font-size="28" fill="${p.accent1}" opacity="0.9"
        letter-spacing="3">${initials}</text>

  <!-- Name -->
  <text x="200" y="153" text-anchor="middle"
        font-family="system-ui,-apple-system,BlinkMacSystemFont,sans-serif"
        font-weight="700" font-size="11" fill="${p.text}" opacity="0.7"
        letter-spacing="0.5">${name.slice(0, 30)}${name.length > 30 ? "…" : ""}</text>

  <!-- Badge -->
  <rect x="151" y="170" width="98" height="16" rx="8" fill="${p.accent1}" opacity="0.12"/>
  <text x="200" y="181" text-anchor="middle"
        font-family="system-ui,-apple-system,BlinkMacSystemFont,sans-serif"
        font-weight="800" font-size="8" fill="${p.accent1}" opacity="0.8"
        letter-spacing="1.2">FIFA 360 VERIFIED</text>

  <!-- Corner marks -->
  <line x1="0" y1="0" x2="20" y2="0" stroke="${p.accent1}" stroke-width="2" opacity="0.4"/>
  <line x1="0" y1="0" x2="0" y2="20" stroke="${p.accent1}" stroke-width="2" opacity="0.4"/>
  <line x1="400" y1="0" x2="380" y2="0" stroke="${p.accent1}" stroke-width="2" opacity="0.4"/>
  <line x1="400" y1="0" x2="400" y2="20" stroke="${p.accent1}" stroke-width="2" opacity="0.4"/>
  <line x1="0" y1="200" x2="20" y2="200" stroke="${p.accent1}" stroke-width="2" opacity="0.4"/>
  <line x1="0" y1="200" x2="0" y2="180" stroke="${p.accent1}" stroke-width="2" opacity="0.4"/>
  <line x1="400" y1="200" x2="380" y2="200" stroke="${p.accent1}" stroke-width="2" opacity="0.4"/>
  <line x1="400" y1="200" x2="400" y2="180" stroke="${p.accent1}" stroke-width="2" opacity="0.4"/>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
