"use client";

import { useEffect } from "react";
import { ToastProvider } from "./ui/Toast";
import { useKeyMomentNotifier } from "@/hooks/useNotifications";

export function Providers({ children }: { children: React.ReactNode }) {
  useKeyMomentNotifier();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return <ToastProvider>{children}</ToastProvider>;
}
