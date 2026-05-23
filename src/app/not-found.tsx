import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative"
         style={{ background: "#040812" }}>
      <div className="absolute inset-0 pitch-bg opacity-30 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(0,102,255,0.12) 0%, transparent 60%)" }} />

      <div className="relative z-10 flex flex-col items-center max-w-sm">
        <div className="text-[80px] mb-4 float">⚽</div>
        <div className="text-[11px] font-black tracking-[0.2em] uppercase mb-3"
             style={{ color: "rgba(0,180,255,0.7)" }}>
          FIFA 360
        </div>
        <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Page Not Found</h1>
        <p className="text-base mb-8" style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
          Looks like this page went out of bounds. Head back to the app.
        </p>
        <Link
          href="/discover"
          className="px-8 py-4 rounded-2xl font-black text-white text-sm"
          style={{
            background: "linear-gradient(135deg, #00b4ff 0%, #0066ff 100%)",
            boxShadow: "0 4px 28px rgba(0,102,255,0.45)",
          }}
        >
          Back to Discover
        </Link>
      </div>
    </div>
  );
}
