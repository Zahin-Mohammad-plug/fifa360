"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  AlertStepper,
  BudgetPicker,
  StylePicker,
  TeamPicker,
  TravelSlider,
} from "@/components/profile-controls";
import { useNotifications } from "@/hooks/useNotifications";
import { useProfile } from "@/hooks/useProfile";
import { DEMO_PROFILE } from "@/lib/mock-data";
import type { FanProfile } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();
  const { requestPermission } = useNotifications();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<FanProfile>({ ...DEMO_PROFILE, ...profile, favoriteTeams: profile.favoriteTeams });

  const patch = (p: Partial<FanProfile>) => setDraft((d) => ({ ...d, ...p }));

  const toggleTeam = (id: string) =>
    patch({
      favoriteTeams: draft.favoriteTeams.includes(id)
        ? draft.favoriteTeams.filter((t) => t !== id)
        : [...draft.favoriteTeams, id],
    });

  const finish = () => {
    setProfile(draft);
    router.push("/");
  };

  const skip = () => {
    setProfile({ ...DEMO_PROFILE });
    router.push("/");
  };

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col py-4">
      {/* Progress */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex flex-1 gap-1.5">
          {[0, 1].map((i) => (
            <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-pitch-300 to-electric-300"
                initial={false}
                animate={{ width: step >= i ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>
        <button onClick={skip} className="text-xs font-medium text-white/45 hover:text-white/70">
          Skip
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">
          {step === 0 ? (
            <>
              Welcome to <span className="gradient-text-animated">FIFA 360</span>
            </>
          ) : (
            "How do you watch?"
          )}
        </h1>
        <p className="mt-1 text-sm text-white/55">
          {step === 0 ? "Who are you cheering for at the 2026 World Cup?" : "We'll tune your venue picks and timing."}
        </p>
      </div>

      {/* Steps */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="s0"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
            >
              <TeamPicker selected={draft.favoriteTeams} onToggle={toggleTeam} />
              <p className="mt-4 text-center text-xs text-white/40">
                {draft.favoriteTeams.length > 0
                  ? `${draft.favoriteTeams.length} team${draft.favoriteTeams.length > 1 ? "s" : ""} selected`
                  : "Pick at least one team to continue"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              className="space-y-6"
            >
              <div>
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-white/50">Watch style</p>
                <StylePicker value={draft.watchStyle} onChange={(v) => patch({ watchStyle: v })} />
              </div>
              <div>
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-white/50">Budget</p>
                <BudgetPicker value={draft.budgetRange} onChange={(v) => patch({ budgetRange: v })} />
              </div>
              <div className="glass rounded-2xl p-4">
                <TravelSlider value={draft.maxTravelMinutes} onChange={(v) => patch({ maxTravelMinutes: v })} />
              </div>
              <div className="glass space-y-3 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Matchday alerts</p>
                    <p className="text-[11px] text-white/40">Leave-now & goal pushes</p>
                  </div>
                  <button
                    onClick={async () => {
                      const next = !draft.notificationsEnabled;
                      if (next) {
                        const ok = await requestPermission();
                        patch({ notificationsEnabled: ok });
                      } else {
                        patch({ notificationsEnabled: false });
                      }
                    }}
                    role="switch"
                    aria-checked={draft.notificationsEnabled}
                    className={`relative h-7 w-12 rounded-full transition-colors ${
                      draft.notificationsEnabled ? "bg-pitch-500" : "bg-white/15"
                    }`}
                  >
                    <motion.span
                      className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
                      animate={{ left: draft.notificationsEnabled ? 24 : 4 }}
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    />
                  </button>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <AlertStepper value={draft.departureAlertMinutes} onChange={(v) => patch({ departureAlertMinutes: v })} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="mt-6 flex gap-3">
        {step === 1 && (
          <Button variant="glass" size="lg" onClick={() => setStep(0)} leftIcon={<ArrowLeft className="h-5 w-5" />}>
            Back
          </Button>
        )}
        {step === 0 ? (
          <Button
            fullWidth
            size="lg"
            onClick={() => setStep(1)}
            disabled={draft.favoriteTeams.length === 0}
            rightIcon={<ArrowRight className="h-5 w-5" />}
          >
            Continue
          </Button>
        ) : (
          <Button fullWidth size="lg" variant="accent" onClick={finish} rightIcon={<Check className="h-5 w-5" />}>
            Start exploring
          </Button>
        )}
      </div>
    </div>
  );
}
