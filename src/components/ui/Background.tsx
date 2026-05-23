// Animated glassmorphism backdrop — fixed behind all content.
export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-24 -top-24 h-[42vh] w-[42vh] rounded-full bg-pitch-500/30 blur-3xl animate-blob" />
      <div className="absolute right-[-10%] top-[10%] h-[38vh] w-[38vh] rounded-full bg-electric-500/25 blur-3xl animate-blob-slow" />
      <div className="absolute bottom-[-10%] left-[20%] h-[40vh] w-[40vh] rounded-full bg-trophy-500/20 blur-3xl animate-blob" style={{ animationDelay: "-8s" }} />
      <div className="absolute bottom-[10%] right-[5%] h-[28vh] w-[28vh] rounded-full bg-fuchsia-600/15 blur-3xl animate-blob-slow" style={{ animationDelay: "-4s" }} />
      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {/* top vignette */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/40 to-transparent" />
    </div>
  );
}
