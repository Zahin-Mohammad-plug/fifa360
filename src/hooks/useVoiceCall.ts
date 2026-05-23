"use client";

import { useCallback, useRef, useState } from "react";
import type { CallStatus, TranscriptLine, RsvpResult, FanProfile } from "@/lib/types";

const DEMO_SCRIPT: { role: TranscriptLine["role"]; text: string; delay: number }[] = [
  {
    role: "agent",
    text:
      "Hi there! I'm an AI assistant calling on behalf of Alex to book a table for the Brazil vs USA match tonight. Do you have availability on the big screen for a party of 3?",
    delay: 1500,
  },
  { role: "venue", text: "Yes, we do! We have a few tables open. What time were you thinking?", delay: 3000 },
  { role: "agent", text: "We'd love to arrive around 6:30 PM, about 30 minutes before kickoff. Does that work?", delay: 2500 },
  { role: "venue", text: "6:30 works perfectly. I'll put it down for 3 guests. Any name for the reservation?", delay: 2500 },
  { role: "agent", text: "Please put it under Alex. Could I get a confirmation number?", delay: 2000 },
  { role: "venue", text: "Absolutely! Your reference number is 4821. Is there anything else you need?", delay: 2500 },
  { role: "agent", text: "That's everything, thank you so much! Alex is looking forward to it!", delay: 2000 },
];

export function useVoiceCall() {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [rsvpResult, setRsvpResult] = useState<RsvpResult | null>(null);
  const cancelledRef = useRef(false);

  const reset = useCallback(() => {
    cancelledRef.current = true;
    setStatus("idle");
    setTranscript([]);
    setRsvpResult(null);
  }, []);

  const initiate = useCallback(
    async (venueId: string, matchId: string, _profile: FanProfile) => {
      void _profile;
      cancelledRef.current = false;
      setStatus("initiating");
      setTranscript([]);
      setRsvpResult(null);

      const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

      try {
        const initRes = await fetch("/api/voice/call", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ venueId, matchId }),
        });
        if (!initRes.ok) throw new Error("init failed");
      } catch {
        // Continue with local demo even if endpoint is missing.
      }

      if (cancelledRef.current) return;
      setStatus("ringing");
      await delay(1600);

      if (cancelledRef.current) return;
      setStatus("in-progress");

      for (const line of DEMO_SCRIPT) {
        await delay(line.delay);
        if (cancelledRef.current) return;
        setTranscript((prev) => [
          ...prev,
          { role: line.role, text: line.text, timestamp: new Date().toISOString() },
        ]);
      }

      await delay(800);
      if (cancelledRef.current) return;

      const result: RsvpResult = {
        confirmed: true,
        partySize: 3,
        arrivalTime: "6:30 PM",
        confirmationRef: "4821",
      };
      setRsvpResult(result);
      setStatus("completed");

      try {
        window.dispatchEvent(new CustomEvent("rsvp-confirmed", { detail: result }));
      } catch {
        // ignore (SSR / no-op)
      }
    },
    [],
  );

  return { status, transcript, rsvpResult, initiate, reset };
}
