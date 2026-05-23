"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import VoiceCallModal from "@/components/VoiceCallModal";
import { useNotifications } from "@/hooks/useNotifications";
import { MOCK_MATCHES, MOCK_VENUES, DEMO_PROFILE } from "@/lib/mock-data";
import type { Match, Venue, FanProfile } from "@/lib/types";

type VoiceModalState = { venue: Venue; match: Match; profile: FanProfile } | null;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [voiceModal, setVoiceModal] = useState<VoiceModalState>(null);

  useNotifications();

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ venueId: string; matchId: string }>).detail;
      const venue = MOCK_VENUES.find((v) => v.id === detail.venueId);
      const match = MOCK_MATCHES.find((m) => m.id === detail.matchId);

      let profile: FanProfile = DEMO_PROFILE;
      try {
        const stored = localStorage.getItem("fanProfile");
        if (stored) profile = JSON.parse(stored);
      } catch {
        // ignore
      }

      if (venue && match) setVoiceModal({ venue, match, profile });
    };

    window.addEventListener("open-voice-modal", handler);
    return () => window.removeEventListener("open-voice-modal", handler);
  }, []);

  return (
    <>
      <main className="min-h-screen pb-[calc(var(--bottom-nav-height)+24px)]">{children}</main>
      <NavBar />
      {voiceModal && (
        <VoiceCallModal
          venue={voiceModal.venue}
          match={voiceModal.match}
          profile={voiceModal.profile}
          onClose={() => setVoiceModal(null)}
        />
      )}
    </>
  );
}
