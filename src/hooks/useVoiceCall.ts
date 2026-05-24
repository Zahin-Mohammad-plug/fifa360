"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CallStatus, RsvpResult, TranscriptLine } from "@/types";
import {
  DEMO_AUDIO_SRC,
  DEMO_AUDIO_SRC_FALLBACK,
  DEMO_RINGING_MS,
  DEMO_RSVP_RESULT,
  DEMO_TRANSCRIPT,
} from "@/lib/demo-script";

interface InitiateArgs {
  venueId: string;
  matchId?: string;
  partySize?: number;
  venueName?: string;
}

interface UseVoiceCallReturn {
  status: CallStatus;
  transcript: TranscriptLine[];
  rsvpResult: RsvpResult | null;
  confirmationMessage: string | null;
  initiate: (args: InitiateArgs) => Promise<void>;
  reset: () => void;
}

/**
 * Drives the AI voice-call RSVP demo pipeline:
 *   1. `initiating` → `ringing` (artificial delay so the user sees the ring)
 *   2. `in-progress` while the recorded call audio plays; transcript cues
 *      are flushed in lockstep with `audio.currentTime`
 *   3. `completed` once the audio ends; the canned RSVP result is POSTed to
 *      `/api/voice/rsvp` to obtain a model-generated confirmation message.
 *
 * This mirrors the call stack used in production-mode (Vapi-backed) calls,
 * so swapping in a real telephony provider later is a drop-in replacement.
 */
export function useVoiceCall(): UseVoiceCallReturn {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [rsvpResult, setRsvpResult] = useState<RsvpResult | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelledRef = useRef(false);

  const cleanupAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.removeAttribute("src");
    try {
      audio.load();
    } catch {
      /* noop */
    }
    audioRef.current = null;
  }, []);

  const reset = useCallback(() => {
    cancelledRef.current = true;
    cleanupAudio();
    setStatus("idle");
    setTranscript([]);
    setRsvpResult(null);
    setConfirmationMessage(null);
  }, [cleanupAudio]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      cleanupAudio();
    };
  }, [cleanupAudio]);

  const initiate = useCallback(
    async ({ venueId, matchId, partySize, venueName }: InitiateArgs) => {
      cancelledRef.current = false;
      setStatus("initiating");
      setTranscript([]);
      setRsvpResult(null);
      setConfirmationMessage(null);

      const delay = (ms: number) =>
        new Promise<void>((resolve) => setTimeout(resolve, ms));

      // ── Ringing ───────────────────────────────────────────────────────
      await delay(120);
      if (cancelledRef.current) return;
      setStatus("ringing");
      await delay(DEMO_RINGING_MS);
      if (cancelledRef.current) return;

      // ── In-progress: play recorded call + sync transcript ──────────────
      setStatus("in-progress");

      const audio = new Audio();
      audio.preload = "auto";
      // Try mp3 first; the browser will fall back via the second source on error.
      audio.src = DEMO_AUDIO_SRC;
      audioRef.current = audio;

      let nextCueIdx = 0;
      const onTimeUpdate = () => {
        while (
          nextCueIdx < DEMO_TRANSCRIPT.length &&
          audio.currentTime >= DEMO_TRANSCRIPT[nextCueIdx].at
        ) {
          const cue = DEMO_TRANSCRIPT[nextCueIdx];
          setTranscript((prev) => [
            ...prev,
            { role: cue.role, text: cue.text, timestamp: new Date().toISOString() },
          ]);
          nextCueIdx += 1;
        }
      };
      audio.addEventListener("timeupdate", onTimeUpdate);

      const finished = new Promise<void>((resolve) => {
        const cleanup = () => {
          audio.removeEventListener("timeupdate", onTimeUpdate);
          audio.removeEventListener("ended", onEnded);
          audio.removeEventListener("error", onError);
          resolve();
        };
        const onEnded = () => cleanup();
        const onError = () => {
          // mp3 unavailable — try the m4a fallback once before giving up.
          if (audio.src.endsWith(".mp3")) {
            audio.src = DEMO_AUDIO_SRC_FALLBACK;
            audio.play().catch(() => cleanup());
            return;
          }
          cleanup();
        };
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onError);
      });

      try {
        await audio.play();
      } catch {
        /* autoplay blocked — the click that triggered initiate should permit it */
      }

      await finished;
      if (cancelledRef.current) return;

      // Flush any cues that the timeupdate handler missed (e.g. fast skip).
      while (nextCueIdx < DEMO_TRANSCRIPT.length) {
        const cue = DEMO_TRANSCRIPT[nextCueIdx];
        setTranscript((prev) => [
          ...prev,
          { role: cue.role, text: cue.text, timestamp: new Date().toISOString() },
        ]);
        nextCueIdx += 1;
      }

      // ── Completed: assemble result + fetch confirmation message ───────
      const result: RsvpResult = {
        ...DEMO_RSVP_RESULT,
        ...(partySize ? { partySize } : {}),
      };

      try {
        const res = await fetch("/api/voice/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...result, venueId, matchId, venueName }),
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data?.confirmationMessage === "string") {
            setConfirmationMessage(data.confirmationMessage);
          }
        }
      } catch {
        /* confirmation endpoint unavailable — demo still completes with canned result */
      }

      if (cancelledRef.current) return;
      setRsvpResult(result);
      setStatus("completed");

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("rsvp-confirmed", { detail: { ...result, venueId, matchId } }),
        );
      }
    },
    [],
  );

  return { status, transcript, rsvpResult, confirmationMessage, initiate, reset };
}
