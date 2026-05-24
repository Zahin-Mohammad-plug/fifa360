import type { RsvpResult, TranscriptLine } from "@/types";

/**
 * Demo cue: a transcript line + the audio timestamp (in seconds) at which
 * it should appear. The cues are synced against `public/audio/rsvp-demo.mp3`.
 */
export interface DemoCue {
  at: number;
  role: TranscriptLine["role"];
  text: string;
}

export const DEMO_TRANSCRIPT: DemoCue[] = [
  {
    at: 5,
    role: "agent",
    text: "Hello, I'm with FIFA 360, I'm the agent for clients who want to make a reservation at your business. I'm curious — what games will you be playing at 6:00 PM today?",
  },
  {
    at: 16,
    role: "venue",
    text: "Hello, good afternoon. The games that will be played today at 6 PM are Mexico vs. Argentina and Venezuela vs. Bolivia.",
  },
  {
    at: 31,
    role: "agent",
    text: "Perfect, those are the games my clients want to see. Please make a reservation for 5 people at 6 PM.",
  },
  {
    at: 36,
    role: "venue",
    text: "Okay, that's fine, I'll do it. Thanks!",
  },
];

/** Final RSVP result the demo "negotiates" — POSTed to /api/voice/rsvp for the confirmation message. */
export const DEMO_RSVP_RESULT: RsvpResult = {
  confirmed: true,
  partySize: 5,
  arrivalTime: "6:00 PM",
  confirmationRef: undefined,
};

export const DEMO_AUDIO_SRC = "/audio/rsvp-demo.mp3";
export const DEMO_AUDIO_SRC_FALLBACK = "/audio/rsvp-demo.m4a";

/** Small delay before audio starts, so the "ringing" state is visible. */
export const DEMO_RINGING_MS = 1800;
