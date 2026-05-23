import { TransitPlan } from "@/types";

export const TRANSIT_PLANS: Record<string, TransitPlan> = {
  "venue-001": {
    venueId: "venue-001",
    totalTime: 14,
    steps: [
      { instruction: "Walk to 49th St / 7th Ave Subway entrance",      duration: 3,  type: "walk"  },
      { instruction: "Take 1/2/3 Train toward Times Square",             duration: 8,  type: "train" },
      { instruction: "Exit at 50th St & walk 100m north along 7th Ave", duration: 3,  type: "walk"  },
      { instruction: "Arrive at El Gaucho NYC",                          duration: 0,  type: "arrive"},
    ],
  },
  "venue-002": {
    venueId: "venue-002",
    totalTime: 22,
    steps: [
      { instruction: "Walk south toward Canal St Subway (A/C/E)",       duration: 5,  type: "walk"  },
      { instruction: "Take A/C/E Line northbound toward Fulton St",      duration: 11, type: "train" },
      { instruction: "Transfer to 1 Train at Chambers St",               duration: 3,  type: "walk"  },
      { instruction: "Walk 3 min along Hudson St to La Cantina Verde",   duration: 3,  type: "walk"  },
      { instruction: "Arrive at La Cantina Verde",                       duration: 0,  type: "arrive"},
    ],
  },
  "venue-003": {
    venueId: "venue-003",
    totalTime: 28,
    steps: [
      { instruction: "Walk to 42nd St / Port Authority Bus Terminal",   duration: 6,  type: "walk"  },
      { instruction: "Take M42 Crosstown Bus westbound",                 duration: 14, type: "bus"   },
      { instruction: "Exit at 34th St / Hudson Yards stop",              duration: 5,  type: "walk"  },
      { instruction: "Walk 3 min to FIFA Fan Zone entrance",             duration: 3,  type: "walk"  },
      { instruction: "Arrive at FIFA Fan Zone – Hudson Yards",           duration: 0,  type: "arrive"},
    ],
  },
  "venue-004": {
    venueId: "venue-004",
    totalTime: 18,
    steps: [
      { instruction: "Walk to Cityplace/Uptown DART Station",            duration: 4,  type: "walk"  },
      { instruction: "Take DART Red Line northbound toward Parker Road",  duration: 10, type: "train" },
      { instruction: "Exit at Hall/Arts District & walk west on Ross",    duration: 4,  type: "walk"  },
      { instruction: "Arrive at Verde Amarelo Dallas",                    duration: 0,  type: "arrive"},
    ],
  },
  "venue-005": {
    venueId: "venue-005",
    totalTime: 25,
    steps: [
      { instruction: "Walk to Mockingbird DART Station",                 duration: 7,  type: "walk"  },
      { instruction: "Take Bus 40 toward Oak Lawn Ave",                   duration: 13, type: "bus"   },
      { instruction: "Exit at Lemmon Ave & 44th St",                      duration: 3,  type: "walk"  },
      { instruction: "Walk 2 min to Taeguk Warriors Sports Bar",          duration: 2,  type: "walk"  },
      { instruction: "Arrive at Taeguk Warriors Sports Bar",              duration: 0,  type: "arrive"},
    ],
  },
  "venue-006": {
    venueId: "venue-006",
    totalTime: 20,
    steps: [
      { instruction: "Walk to Hollywood/Highland Metro Station",          duration: 4,  type: "walk"  },
      { instruction: "Take Metro B Line (Red) toward Agoura Hills",       duration: 12, type: "train" },
      { instruction: "Exit at La Brea / Sunset stop",                     duration: 0,  type: "walk"  },
      { instruction: "Walk 4 min to Les Bleus LA Terrace",                duration: 4,  type: "walk"  },
      { instruction: "Arrive at Les Bleus LA Terrace",                    duration: 0,  type: "arrive"},
    ],
  },
  "venue-007": {
    venueId: "venue-007",
    totalTime: 30,
    steps: [
      { instruction: "Walk to Pershing Square Metro Station",             duration: 8,  type: "walk"  },
      { instruction: "Take Metro B/D Line toward North Hollywood",        duration: 15, type: "train" },
      { instruction: "Exit at Wilshire/Vermont & take Bus 720",           duration: 5,  type: "bus"   },
      { instruction: "Walk 2 min along 6th St to Atlas Lions Lounge",     duration: 2,  type: "walk"  },
      { instruction: "Arrive at Atlas Lions Lounge",                      duration: 0,  type: "arrive"},
    ],
  },
};
