export type NotificationEventType =
  | "match-starting"
  | "kickoff"
  | "goal"
  | "red-card"
  | "halftime"
  | "fulltime"
  | "momentum-swing"
  | "next-game";

export interface NotificationPreferences {
  enabled: boolean;
  types: Record<NotificationEventType, boolean>;
}

export const DEFAULT_PREFS: NotificationPreferences = {
  enabled: false,
  types: {
    "match-starting": true,
    kickoff: true,
    goal: true,
    "red-card": true,
    halftime: false,
    fulltime: true,
    "momentum-swing": false,
    "next-game": true,
  },
};

export const EVENT_LABELS: Record<NotificationEventType, string> = {
  "match-starting": "Match Starting Soon",
  kickoff: "Kickoff",
  goal: "Goal Scored",
  "red-card": "Red Card",
  halftime: "Half-Time",
  fulltime: "Full-Time",
  "momentum-swing": "Momentum Swing",
  "next-game": "Next Game Reminder",
};

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function sendNotification(title: string, body: string, icon?: string): void {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: icon ?? "/icon-192.png",
    badge: "/badge.png",
    tag: "fifa360-match",
  });
}

export function simulateMatchNotifications(
  matchName: string,
  prefs: NotificationPreferences
): void {
  if (!prefs.enabled) return;

  const schedule = [
    { delay: 2000, type: "match-starting" as NotificationEventType, title: "⚽ Match Starting Soon", body: `${matchName} kicks off in 15 minutes` },
    { delay: 8000, type: "kickoff" as NotificationEventType, title: "🎉 Kickoff!", body: `${matchName} is underway!` },
    { delay: 15000, type: "goal" as NotificationEventType, title: "⚽ GOAL!", body: `Argentina take the lead! 1–0` },
    { delay: 25000, type: "goal" as NotificationEventType, title: "⚽ GOAL!", body: `France equalise through Mbappé. 1–1` },
    { delay: 35000, type: "halftime" as NotificationEventType, title: "🟡 Half-Time", body: `Argentina 1–1 France. Back in 15 minutes.` },
    { delay: 45000, type: "goal" as NotificationEventType, title: "⚽ GOAL!", body: `Dybala puts Argentina back in front! 2–1` },
    { delay: 60000, type: "fulltime" as NotificationEventType, title: "🏆 Full-Time", body: `Argentina win 2–1. What a match!` },
  ];

  schedule.forEach(({ delay, type, title, body }) => {
    if (prefs.types[type]) {
      setTimeout(() => sendNotification(title, body), delay);
    }
  });
}
