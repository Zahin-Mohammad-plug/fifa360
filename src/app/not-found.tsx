import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ background: "#070c04" }}
    >
      <div className="text-[80px] mb-4 animate-float">⚽</div>
      <div
        className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase mb-3"
        style={{ color: "rgba(204,255,0,0.6)" }}
      >
        Matchday Concierge
      </div>
      <h1 className="text-3xl font-black mb-3 tracking-tight" style={{ color: "#f9fbf8" }}>
        Page Not Found
      </h1>
      <p className="text-base mb-8 max-w-xs leading-relaxed" style={{ color: "#83927d" }}>
        Looks like this page went out of bounds. Head back to the app.
      </p>
      <Link
        href="/discover"
        className="px-8 py-4 rounded-2xl font-black text-sm"
        style={{ background: "#ccff00", color: "#070c04" }}
      >
        Back to Discover
      </Link>
    </div>
  );
}
