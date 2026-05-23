import { Suspense } from "react";
import { SharePageContent } from "./SharePageContent";

export default function SharePage() {
  return (
    <Suspense fallback={<ShareLoadingFallback />}>
      <SharePageContent />
    </Suspense>
  );
}

function ShareLoadingFallback() {
  return (
    <div className="min-h-dvh bg-[#070b14] flex items-center justify-center">
      <div className="text-white/30 text-sm animate-pulse">Loading plan…</div>
    </div>
  );
}
