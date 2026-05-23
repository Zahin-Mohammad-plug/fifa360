"use client";

import { motion } from "framer-motion";
import { Bell, RotateCcw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHeading } from "@/components/ui/PageHeading";
import { useToast } from "@/components/ui/Toast";
import {
  AlertStepper,
  BudgetPicker,
  StylePicker,
  TeamPicker,
  TravelSlider,
} from "@/components/profile-controls";
import { useNotifications } from "@/hooks/useNotifications";
import { useProfile } from "@/hooks/useProfile";
import { TEAMS } from "@/lib/mock-data";

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <GlassCard className="space-y-3 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{title}</p>
      {children}
    </GlassCard>
  );
}

export default function ProfilePage() {
  const { profile, updateProfile, reset, ready } = useProfile();
  const { permission, requestPermission } = useNotifications();
  const { toast } = useToast();

  const toggleTeam = (id: string) => {
    const has = profile.favoriteTeams.includes(id);
    const next = has
      ? profile.favoriteTeams.filter((t) => t !== id)
      : [...profile.favoriteTeams, id];
    updateProfile({ favoriteTeams: next });
  };

  const toggleNotif = async () => {
    if (!profile.notificationsEnabled) {
      const ok = await requestPermission();
      updateProfile({ notificationsEnabled: ok });
      toast(ok ? "Notifications enabled" : "Permission blocked", {
        description: ok ? "We'll alert you when it's time to leave." : "Allow notifications in your browser settings.",
        kind: ok ? "success" : "error",
      });
    } else {
      updateProfile({ notificationsEnabled: false });
      toast("Notifications off", { kind: "info" });
    }
  };

  const handleReset = () => {
    reset();
    toast("Profile reset to defaults", { kind: "info" });
  };

  if (!ready) return <div className="pt-10" />;

  const favNames = profile.favoriteTeams.map((t) => TEAMS[t]?.name).filter(Boolean).join(", ");

  return (
    <div className="space-y-4 pb-4">
      <PageHeading
        title="Your profile"
        subtitle={favNames ? `Supporting ${favNames}` : "Set your matchday preferences"}
        right={
          <button
            onClick={handleReset}
            aria-label="Reset"
            className="focus-ring pressable grid h-10 w-10 place-items-center rounded-full glass"
          >
            <RotateCcw className="h-4 w-4 text-white/60" />
          </button>
        }
      />

      <Field title="Your teams">
        <TeamPicker selected={profile.favoriteTeams} onToggle={toggleTeam} />
      </Field>

      <Field title="Watch style">
        <StylePicker value={profile.watchStyle} onChange={(v) => updateProfile({ watchStyle: v })} />
      </Field>

      <Field title="Budget">
        <BudgetPicker value={profile.budgetRange} onChange={(v) => updateProfile({ budgetRange: v })} />
      </Field>

      <Field title="Travel">
        <TravelSlider value={profile.maxTravelMinutes} onChange={(v) => updateProfile({ maxTravelMinutes: v })} />
      </Field>

      <Field title="Notifications">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-pitch-400/20 text-pitch-300">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Departure & goal alerts</p>
              <p className="text-[11px] text-white/45">
                {permission === "unsupported" ? "Not supported here" : permission === "granted" ? "Allowed" : "Tap to enable"}
              </p>
            </div>
          </div>
          <button
            onClick={toggleNotif}
            role="switch"
            aria-checked={profile.notificationsEnabled}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              profile.notificationsEnabled ? "bg-pitch-500" : "bg-white/15"
            }`}
          >
            <motion.span
              layout
              className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
              animate={{ left: profile.notificationsEnabled ? 24 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          </button>
        </div>
        <div className="border-t border-white/10 pt-3">
          <AlertStepper
            value={profile.departureAlertMinutes}
            onChange={(v) => updateProfile({ departureAlertMinutes: v })}
          />
        </div>
      </Field>

      <Button href="/profile/onboarding" variant="glass" fullWidth size="lg" leftIcon={<Wand2 className="h-5 w-5" />}>
        Redo onboarding
      </Button>
      <p className="text-center text-[11px] text-white/35">Changes save automatically to this device.</p>
    </div>
  );
}
