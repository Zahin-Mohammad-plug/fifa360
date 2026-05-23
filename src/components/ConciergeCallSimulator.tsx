"use client";

import { useState, useCallback } from "react";
import { Venue } from "@/types";
import { Phone, PhoneCall, CheckCircle, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { motion, AnimatePresence } from "framer-motion";

interface CallStep { venue: Venue; status: "pending" | "calling" | "done" | "failed"; duration?: number; }
interface Props { venues: Venue[]; onComplete: () => void; }

function CallRow({ step, index }: { step: CallStep; index: number }) {
  const statusColor = step.status === "done" ? "#00ff88"
    : step.status === "failed" ? "#ff1744"
    : step.status === "calling" ? "#00b4ff"
    : "rgba(255,255,255,0.2)";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 py-2.5"
      style={{ borderBottom: index < 4 ? "1px solid rgba(255,255,255,0.05)" : undefined }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all"
           style={{
             background: `${statusColor}18`,
             border: `1px solid ${statusColor}35`,
             boxShadow: step.status === "calling" ? `0 0 12px ${statusColor}30` : undefined,
           }}>
        {step.status === "calling" && <PhoneCall className="w-3.5 h-3.5 animate-pulse" style={{ color: statusColor }} />}
        {step.status === "done"    && <CheckCircle className="w-3.5 h-3.5" style={{ color: statusColor }} />}
        {step.status === "failed"  && <Phone className="w-3.5 h-3.5" style={{ color: statusColor }} />}
        {step.status === "pending" && <Phone className="w-3.5 h-3.5" style={{ color: statusColor }} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold truncate"
             style={{ color: step.status === "pending" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)" }}>
          {step.venue.name}
        </div>
        <div className="text-[10px] mt-0.5 transition-all"
             style={{ color: statusColor, opacity: 0.8 }}>
          {step.status === "calling" && "Calling…"}
          {step.status === "done"    && `Verified · ${step.duration}s`}
          {step.status === "failed"  && "No answer – skipped"}
          {step.status === "pending" && "Queued"}
        </div>
      </div>

      {step.status === "calling" && (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" style={{ color: "#00b4ff" }} />
      )}
      {step.status === "done" && (
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
              style={{
                color: "#00ff88",
                background: "rgba(0,255,136,0.12)",
                border: "1px solid rgba(0,255,136,0.25)",
              }}>
          ✓
        </span>
      )}
    </motion.div>
  );
}

export function ConciergeCallSimulator({ venues, onComplete }: Props) {
  const { setConciergeRunning, setConciergeDone } = useAppStore();
  const [steps,    setSteps]    = useState<CallStep[]>(venues.map((v) => ({ venue: v, status: "pending" })));
  const [started,  setStarted]  = useState(false);
  const [finished, setFinished] = useState(false);

  const runCalls = useCallback(async () => {
    setStarted(true);
    setConciergeRunning(true);
    for (let i = 0; i < venues.length; i++) {
      setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, status: "calling" } : s));
      const duration = 1500 + Math.random() * 2000;
      await new Promise((r) => setTimeout(r, duration));
      const ok = Math.random() > 0.15;
      setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, status: ok ? "done" : "failed", duration: Math.round(duration / 1000) } : s));
      if (i < venues.length - 1) await new Promise((r) => setTimeout(r, 500));
    }
    setConciergeRunning(false);
    setConciergeDone(true);
    setFinished(true);
  }, [venues, setConciergeRunning, setConciergeDone]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl p-5 space-y-4 overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, rgba(124,77,255,0.12) 0%, rgba(12,26,46,0.9) 100%)",
        border: "1px solid rgba(124,77,255,0.3)",
        boxShadow: "0 0 32px rgba(124,77,255,0.08) inset",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
             style={{
               background: "rgba(124,77,255,0.2)",
               border: "1px solid rgba(124,77,255,0.4)",
               boxShadow: started && !finished ? "0 0 16px rgba(124,77,255,0.4)" : undefined,
             }}>
          <Phone className={`w-5 h-5 ${started && !finished ? "animate-pulse" : ""}`}
                 style={{ color: "#7c4dff" }} />
        </div>
        <div>
          <div className="text-sm font-black text-white">
            {finished ? "Calls Complete" : started ? "Calling Venues…" : "Venue Concierge"}
          </div>
          <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            {finished
              ? "Rankings updated with live intel"
              : started
              ? "Getting live venue intel"
              : "Call shortlisted venues to verify RSVP & capacity"}
          </div>
        </div>
      </div>

      {/* Call list */}
      <div className="rounded-xl px-3"
           style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {steps.map((step, i) => (
          <CallRow key={step.venue.id} step={step} index={i} />
        ))}
      </div>

      {/* Action button */}
      <AnimatePresence mode="wait">
        {!started ? (
          <motion.button
            key="start"
            whileTap={{ scale: 0.97 }}
            onClick={runCalls}
            className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #7c4dff 0%, #a57aff 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 20px rgba(124,77,255,0.4)",
            }}
          >
            <Phone className="w-4 h-4" />
            Check All Venues
          </motion.button>
        ) : finished ? (
          <motion.button
            key="done"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={onComplete}
            className="w-full py-3.5 rounded-2xl font-black text-sm"
            style={{
              background: "linear-gradient(135deg, #00b4ff 0%, #0066ff 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 20px rgba(0,102,255,0.4)",
            }}
          >
            View Updated Rankings →
          </motion.button>
        ) : null}
      </AnimatePresence>

      {!started && (
        <p className="text-center text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>
          Demo mode · Uses pre-loaded venue data
        </p>
      )}
    </motion.div>
  );
}
