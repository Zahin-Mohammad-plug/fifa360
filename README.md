# FIFA 360 — World Cup 2026 Companion

A mobile-first hackathon app that helps fans **decide where to watch, get there smoothly, stay updated live, and verify venue conditions** through proactive outbound calls.

## Features

| Feature | Status |
|---------|--------|
| 🏟 Match picker | ✅ |
| 🏆 Personalized venue ranking | ✅ Weighted scoring model (distance, crowd fit, capacity, vibe, trust) |
| 📞 Venue concierge calls | ✅ AI-powered simulation with structured results |
| 🗺 Transportation planner (MapKit JS) | ✅ Demo mode + live with token |
| 🔗 Share plan link | ✅ URL-encoded shareable matchday plan |
| 📡 Live match scoreboard | ✅ Score, timeline, key moments |
| ⏱ Event timeline | ✅ Goals, cards, subs, VAR, halftime |
| 🔔 Push notifications | ✅ Browser Notification API + demo mode |
| 👤 Preference profile | ✅ Team, party size, vibe, budget |

## Getting Started

```bash
cd fifa360
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/discover`.

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_MAPKIT_TOKEN` | Optional | Apple MapKit JS JWT token. Without it, a stylised demo map renders automatically. Docs: [Apple Developer](https://developer.apple.com/documentation/mapkitjs/creating_and_using_tokens_with_mapkit_js). |

## Demo Flow (3 minutes)

1. **Discover** → Select *Argentina vs France* match
2. Tap **Check All Venues** → Watch AI concierge calls simulate
3. Open *Estadio Bar & Grill* (Top Pick) → Review concierge intel
4. Tap **Plan Route →** → See route planner with departure countdown
5. Tap **Share Plan** → Copy shareable link
6. Tap **Set Alerts** → Enable browser notifications → Run Demo Alerts
7. Switch to **Live** tab → See live score, timeline, next game

## Architecture

```
src/
├── app/
│   ├── discover/      # Match picker + ranked venue list + concierge simulator
│   ├── route/         # MapKit JS route planner + share plan
│   ├── live/          # Live scoreboard + event timeline + next game
│   ├── profile/       # User preferences + notification settings
│   └── share/         # Shareable plan landing page
├── components/        # All UI components
├── data/              # Seed data: matches + venues
├── lib/               # Ranking engine, share link, notifications
├── store/             # Zustand global state (persisted)
└── types/             # TypeScript interfaces
```

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript** + **Tailwind CSS v4**
- **shadcn/ui** (Badge, Sheet, Dialog, Skeleton, Card, Tabs)
- **Zustand** state management (localStorage persisted)
- **MapKit JS** (Apple Maps) — graceful fallback to demo map
- **Browser Notification API** for push alerts
- **Lucide React** icons

## Venue Scoring Model

Venues are ranked 0–100 using:

| Signal | Weight |
|--------|--------|
| Distance / ETA | 20% |
| Team crowd fit | 20% |
| Capacity confidence | 15% |
| RSVP / group friendliness | 10% |
| Venue atmosphere fit | 15% |
| Official/trust source | 10% |
| Amenities & accessibility | 10% |

## Deploy to Vercel

```bash
vercel deploy --prod
```

No env vars required for a fully-functional demo. Add `NEXT_PUBLIC_MAPKIT_TOKEN` to enable live Apple Maps.

---

Built for FIFA World Cup 2026 Hackathon · FIFA 360
