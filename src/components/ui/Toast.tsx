"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, AlertTriangle } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "info" | "error";
interface Toast {
  id: number;
  message: string;
  description?: string;
  kind: ToastKind;
}

interface ToastCtx {
  toast: (message: string, opts?: { description?: string; kind?: ToastKind }) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

const ICONS = {
  success: CheckCircle2,
  info: Info,
  error: AlertTriangle,
};
const ACCENT = {
  success: "text-pitch-300",
  info: "text-electric-300",
  error: "text-rose-300",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback<ToastCtx["toast"]>((message, opts) => {
    const id = Date.now() + Math.random();
    const t: Toast = { id, message, description: opts?.description, kind: opts?.kind ?? "success" };
    setToasts((prev) => [...prev, t]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.kind];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -24, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="glass-strong pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3"
              >
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", ACCENT[t.kind])} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">{t.message}</p>
                  {t.description && <p className="mt-0.5 text-xs text-white/60">{t.description}</p>}
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                  className="pressable rounded-full p-1 text-white/40 hover:text-white"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
