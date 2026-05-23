import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    // URLSearchParams from new URL(req.url) is synchronous — not the async page prop
    const url = new URL(req.url);
    const home     = url.searchParams.get("home")  ?? "Argentina";
    const away     = url.searchParams.get("away")  ?? "France";
    const homeFlag = url.searchParams.get("hf")    ?? "🇦🇷";
    const awayFlag = url.searchParams.get("af")    ?? "🇫🇷";
    const venue    = url.searchParams.get("venue") ?? "Estadio Bar & Grill";

    return new ImageResponse(
      (
        <div
          style={{
            width: 1200, height: 630,
            background: "linear-gradient(135deg,#070b14 0%,#0d1a35 50%,#070b14 100%)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            fontFamily: "system-ui,sans-serif", color: "white", position: "relative",
          }}
        >
          {/* Grid background */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.06,
            backgroundImage: "linear-gradient(rgba(6,214,245,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(6,214,245,.5) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }} />

          {/* Label */}
          <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(6,214,245,.8)", letterSpacing: "0.2em", marginBottom: 32 }}>
            FIFA 360 · MATCHDAY PLAN
          </div>

          {/* Match row */}
          <div style={{ display: "flex", alignItems: "center", gap: 48, marginBottom: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 96 }}>{homeFlag}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,.8)" }}>{home}</div>
            </div>
            <div style={{ fontSize: 64, fontWeight: 900, color: "rgba(255,255,255,.2)" }}>vs</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 96 }}>{awayFlag}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,.8)" }}>{away}</div>
            </div>
          </div>

          {/* Venue pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,.07)",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 99, padding: "12px 28px",
          }}>
            <span style={{ color: "#ff2d78", fontSize: 20 }}>📍</span>
            <span style={{ fontSize: 20, color: "rgba(255,255,255,.7)" }}>{venue}</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (err) {
    console.error("[/api/og] ImageResponse failed:", err);
    return new Response("OG image generation failed", { status: 500 });
  }
}
