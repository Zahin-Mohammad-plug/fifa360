"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneCall,
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  PhoneOff,
  Bot,
  Building2,
} from "lucide-react";
import type { Venue, Match } from "@/types";
import { useVoiceCall } from "@/hooks/useVoiceCall";

/**
 * VoiceCallModal
 * ──────────────
 * AI-driven RSVP voice-call flow. Triggered from the "RSVP AI" button on
 * any venue card. Render this once at the page (or layout) level and pass
 * the currently-selected venue + match. When `venue` is null the modal
 * is hidden.
 *
 * The visual shell + open/close lifecycle is wired up here. The voice
 * pipeline itself lives in `useVoiceCall` — when this modal opens it
 * automatically initiates a call (ringing → recorded conversation +
 * synced transcript → confirmed RSVP card with a model-generated
 * confirmation message).
 */

export interface VoiceCallModalProps {
  /** The venue to RSVP for. `null` keeps the modal closed. */
  venue: Venue | null;
  /** Optional match context — passed through to the voice agent. */
  match?: Match | null;
  /** Optional desired party size — comes from user preferences. */
  partySize?: number;
  /** Close handler — must clear the venue selection. */
  onClose: () => void;
  /**
   * Optional callback fired once the RSVP completes successfully.
   * The pipeline implementer can wire this to refresh venue state,
   * push a toast, or persist the confirmation.
   */
  onRsvpConfirmed?: (result: VoiceCallResult) => void;
}

/** Result returned by the voice-call pipeline when an RSVP completes. */
export interface VoiceCallResult {
  venueId: string;
  status: "confirmed" | "waitlisted" | "declined" | "no-answer";
  partySize: number;
  notes?: string;
  calledAt: string;
}

const NEON = "#ccff00";
const NEON_DIM = "#a3cc00";
const SAGE = "#7a8a75";
const TEXT = "#f5f9f3";
const TEXT_SOFT = "#d8e8d4";

export function VoiceCallModal({
  venue,
  match,
  partySize = 4,
  onClose,
  onRsvpConfirmed,
}: VoiceCallModalProps) {
  const open = venue !== null;

  const { status, transcript, rsvpResult, confirmationMessage, initiate, reset } =
    useVoiceCall();

  const initiatedForRef = useRef<string | null>(null);
  const confirmedFiredRef = useRef<string | null>(null);

  /* Auto-initiate the call when the modal opens for a new venue. */
  useEffect(() => {
    if (!open || !venue) return;
    if (initiatedForRef.current === venue.id) return;
    initiatedForRef.current = venue.id;
    confirmedFiredRef.current = null;
    void initiate({ venueId: venue.id, matchId: match?.id, partySize });
  }, [open, venue, match?.id, partySize, initiate]);

  /* Fire the parent's confirmation callback exactly once per call. */
  useEffect(() => {
    if (!venue) return;
    if (status !== "completed" || !rsvpResult?.confirmed) return;
    if (confirmedFiredRef.current === venue.id) return;
    confirmedFiredRef.current = venue.id;
    onRsvpConfirmed?.({
      venueId: venue.id,
      status: "confirmed",
      partySize: rsvpResult.partySize,
      notes: rsvpResult.notes,
      calledAt: new Date().toISOString(),
    });
  }, [status, rsvpResult, venue, onRsvpConfirmed]);

  const handleClose = () => {
    reset();
    initiatedForRef.current = null;
    confirmedFiredRef.current = null;
    onClose();
  };

  /* Esc + body scroll lock. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const statusLabel: Record<typeof status, string> = {
    idle: "Tap to start the call",
    initiating: "Connecting…",
    ringing: venue ? `Calling ${venue.name}…` : "Calling…",
    "in-progress": "Live conversation in progress…",
    completed: rsvpResult?.confirmed ? "Table confirmed" : "Call completed",
    failed: "Couldn't reach the venue",
  };

  return (
    <AnimatePresence>
      {open && venue && (
        <motion.div
          key="voice-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={handleClose}
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center px-3 pb-3 sm:pb-0"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(204,255,0,0.08), rgba(0,0,0,0.62) 70%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <motion.div
            key="voice-modal-card"
            initial={{ y: 28, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[85vh]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, transparent 45%), rgba(10,18,7,0.94)",
              border: "1px solid rgba(204,255,0,0.22)",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(204,255,0,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`AI voice-call RSVP for ${venue.name}`}
          >
            {/* Top neon hairline */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #ccff00 50%, transparent)",
                opacity: 0.85,
              }}
            />

            {/* Header */}
            <div className="flex items-start gap-3 px-5 pt-5 pb-3 flex-shrink-0">
              <div
                className="flex items-center justify-center rounded-2xl flex-shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  background:
                    "linear-gradient(135deg, rgba(204,255,0,0.22) 0%, rgba(10,18,7,0.9) 100%)",
                  border: "1px solid rgba(204,255,0,0.4)",
                  boxShadow: "0 0 16px rgba(204,255,0,0.18)",
                }}
              >
                <PhoneCall className="w-5 h-5" style={{ color: NEON }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" style={{ color: NEON }} />
                  <span
                    className="text-[9.5px] font-mono font-bold uppercase"
                    style={{ color: NEON, letterSpacing: "0.15em" }}
                  >
                    AI Voice RSVP
                  </span>
                </div>
                <h3
                  className="text-[15px] font-extrabold leading-tight mt-1 truncate"
                  style={{ color: TEXT }}
                >
                  {venue.name}
                </h3>
                <p
                  className="text-[10.5px] font-mono mt-0.5 truncate"
                  style={{ color: SAGE }}
                >
                  Party of {partySize}
                  {match ? ` · ${match.homeShort} vs ${match.awayShort}` : ""}
                </p>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: SAGE,
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status bar */}
            <div
              className="px-5 py-2.5 flex items-center gap-2 flex-shrink-0"
              style={{
                background: "rgba(0,0,0,0.32)",
                borderTop: "1px solid rgba(255,255,255,0.04)",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <StatusIcon status={status} />
              <span
                className="text-[11px] font-mono"
                style={{ color: TEXT_SOFT, letterSpacing: "0.04em" }}
              >
                {statusLabel[status]}
              </span>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {/* Pre-call hint while ringing with empty transcript */}
              {(status === "initiating" || status === "ringing") && transcript.length === 0 && (
                <div
                  className="rounded-2xl px-4 py-5 flex flex-col items-center text-center gap-3"
                  style={{
                    background: "rgba(5,9,3,0.7)",
                    border: "1px dashed rgba(204,255,0,0.22)",
                  }}
                >
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(204,255,0,0.1)",
                        border: "1px solid rgba(204,255,0,0.3)",
                      }}
                    >
                      <PhoneCall className="w-5 h-5" style={{ color: NEON }} />
                    </div>
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{
                        border: "1px solid rgba(204,255,0,0.45)",
                        animation: "live-pulse 1.4s infinite ease-in-out",
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold" style={{ color: TEXT_SOFT }}>
                      Reaching {venue.name}…
                    </p>
                    <p className="text-[10.5px] mt-1 leading-relaxed" style={{ color: SAGE }}>
                      Our AI agent will negotiate a table for {partySize} and
                      confirm the matchday details on your behalf.
                    </p>
                  </div>
                </div>
              )}

              {/* Live transcript */}
              {transcript.length > 0 && (
                <div className="space-y-2">
                  <div
                    className="text-[9px] font-mono font-bold uppercase tracking-wider"
                    style={{ color: SAGE, letterSpacing: "0.18em" }}
                  >
                    Live Transcript
                  </div>
                  <div className="space-y-2">
                    {transcript.map((line, i) => (
                      <TranscriptBubble
                        key={`${i}-${line.timestamp}`}
                        role={line.role}
                        text={line.text}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* RSVP confirmed card */}
              {rsvpResult?.confirmed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32 }}
                  className="rounded-2xl p-4"
                  style={{
                    background:
                      "linear-gradient(140deg, rgba(204,255,0,0.16) 0%, rgba(10,18,7,0.8) 80%)",
                    border: "1px solid rgba(204,255,0,0.4)",
                    boxShadow: "0 0 24px rgba(204,255,0,0.12)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4" style={{ color: NEON }} />
                    <span
                      className="text-[10px] font-mono font-bold uppercase"
                      style={{ color: NEON, letterSpacing: "0.18em" }}
                    >
                      Table Confirmed
                    </span>
                  </div>
                  <dl className="space-y-1.5 text-[12px]" style={{ color: TEXT_SOFT }}>
                    <ResultRow label="Party size" value={`${rsvpResult.partySize} guests`} />
                    <ResultRow label="Arrival time" value={rsvpResult.arrivalTime} />
                    {rsvpResult.confirmationRef && (
                      <ResultRow
                        label="Reference"
                        value={`#${rsvpResult.confirmationRef}`}
                        valueColor={NEON}
                        mono
                      />
                    )}
                    {rsvpResult.notes && (
                      <p className="text-[11px] italic mt-1" style={{ color: SAGE }}>
                        {rsvpResult.notes}
                      </p>
                    )}
                  </dl>

                  {confirmationMessage && (
                    <div
                      className="mt-3 pt-3"
                      style={{ borderTop: "1px solid rgba(204,255,0,0.18)" }}
                    >
                      <div
                        className="text-[9px] font-mono font-bold uppercase mb-1"
                        style={{ color: NEON_DIM, letterSpacing: "0.18em" }}
                      >
                        Concierge confirmation
                      </div>
                      <p
                        className="text-[12px] leading-snug"
                        style={{ color: TEXT_SOFT }}
                      >
                        {confirmationMessage}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Failed state */}
              {status === "failed" && !rsvpResult?.confirmed && (
                <div
                  className="rounded-2xl p-4 text-center"
                  style={{
                    background: "rgba(40,8,8,0.6)",
                    border: "1px solid rgba(255,59,48,0.4)",
                  }}
                >
                  <PhoneOff
                    className="w-5 h-5 mx-auto mb-1.5"
                    style={{ color: "#ff3b30" }}
                  />
                  <p className="text-[12px] font-semibold" style={{ color: TEXT_SOFT }}>
                    Could not reach {venue.name}
                  </p>
                  <p className="text-[10.5px] mt-1" style={{ color: SAGE }}>
                    Try again in a moment, or pick another venue from the list.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between gap-3 px-5 py-3 flex-shrink-0"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(0,0,0,0.25)",
              }}
            >
              <span
                className="text-[9.5px] font-mono truncate"
                style={{ color: SAGE, letterSpacing: "0.06em" }}
              >
                {venue.address}
              </span>

              {(status === "completed" || status === "failed") ? (
                <button
                  onClick={handleClose}
                  className="text-[10.5px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors cursor-pointer flex-shrink-0"
                  style={{
                    background: "rgba(204,255,0,0.1)",
                    border: "1px solid rgba(204,255,0,0.28)",
                    color: NEON,
                    letterSpacing: "0.12em",
                  }}
                >
                  Done
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="text-[10.5px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors cursor-pointer flex-shrink-0"
                  style={{
                    background: "rgba(255,59,48,0.08)",
                    border: "1px solid rgba(255,59,48,0.32)",
                    color: "#ff8a82",
                    letterSpacing: "0.12em",
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function StatusIcon({ status }: { status: ReturnType<typeof useVoiceCall>["status"] }) {
  if (status === "initiating") {
    return <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: NEON }} />;
  }
  if (status === "ringing" || status === "in-progress") {
    return (
      <span
        className="w-2 h-2 rounded-full"
        style={{
          background: status === "ringing" ? "#f59e0b" : NEON,
          boxShadow: `0 0 8px ${status === "ringing" ? "#f59e0b" : NEON}`,
          animation: "live-pulse 1.4s infinite ease-in-out",
        }}
      />
    );
  }
  if (status === "completed") {
    return <CheckCircle2 className="w-3.5 h-3.5" style={{ color: NEON }} />;
  }
  if (status === "failed") {
    return <PhoneOff className="w-3.5 h-3.5" style={{ color: "#ff3b30" }} />;
  }
  return <PhoneCall className="w-3.5 h-3.5" style={{ color: SAGE }} />;
}

function TranscriptBubble({
  role,
  text,
}: {
  role: "agent" | "venue";
  text: string;
}) {
  const isAgent = role === "agent";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex gap-2 items-start ${isAgent ? "flex-row" : "flex-row-reverse"}`}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: 22,
          height: 22,
          background: isAgent ? "rgba(204,255,0,0.16)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${isAgent ? "rgba(204,255,0,0.4)" : "rgba(255,255,255,0.1)"}`,
        }}
      >
        {isAgent ? (
          <Bot className="w-3 h-3" style={{ color: NEON }} />
        ) : (
          <Building2 className="w-3 h-3" style={{ color: SAGE }} />
        )}
      </div>
      <div
        className="rounded-2xl px-3 py-2 text-[12px] leading-snug max-w-[82%]"
        style={
          isAgent
            ? {
                background: "rgba(204,255,0,0.08)",
                border: "1px solid rgba(204,255,0,0.22)",
                color: TEXT_SOFT,
                borderTopLeftRadius: 4,
              }
            : {
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: TEXT_SOFT,
                borderTopRightRadius: 4,
              }
        }
      >
        {text}
      </div>
    </motion.div>
  );
}

function ResultRow({
  label,
  value,
  valueColor,
  mono = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[10.5px] font-mono" style={{ color: SAGE, letterSpacing: "0.04em" }}>
        {label}
      </dt>
      <dd
        className={`text-[12px] font-semibold truncate ${mono ? "font-mono" : ""}`}
        style={{ color: valueColor ?? TEXT }}
      >
        {value}
      </dd>
    </div>
  );
}
