"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Navigation, Phone, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PageHeading } from "@/components/ui/PageHeading";
import { useProfile } from "@/hooks/useProfile";
import { getNextUpcomingMatch, getVenue } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { ConciergeMessage } from "@/lib/types";

const SUGGESTIONS = [
  "Is it loud there?",
  "Can I get there by train?",
  "What time should I leave?",
  "How pricey is it?",
];

export default function ConciergePage() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const { profile } = useProfile();
  const matchId = params.get("matchId") || getNextUpcomingMatch().id;
  const venue = getVenue(id);

  const [messages, setMessages] = useState<ConciergeMessage[]>([
    {
      role: "assistant",
      content: venue
        ? `Hey! You're asking about ${venue.name}. I can tell you the vibe, plan your route, or work out when to leave. What's up?`
        : "Hi! I'm your matchday concierge. How can I help?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<{ type?: string; venueId?: string }>({});
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: ConciergeMessage = { role: "user", content: trimmed, timestamp: new Date().toISOString() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setAction({});
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(1), profile, venueId: id }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply, timestamp: new Date().toISOString() }]);
      setAction({ type: data.action, venueId: data.actionVenueId || id });
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I'm having trouble connecting — give me a moment and try again.", timestamp: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col">
      <PageHeading
        title="Concierge"
        subtitle={venue ? venue.name : "Matchday assistant"}
        back
        right={
          <div className="grid h-10 w-10 place-items-center rounded-full bg-pitch-400/20 text-pitch-300">
            <Sparkles className="h-5 w-5" />
          </div>
        }
      />

      {/* Messages */}
      <div className="flex-1 space-y-3 pb-48">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "rounded-br-md bg-gradient-to-br from-pitch-400 to-emerald-600 text-white"
                    : "glass rounded-bl-md text-white/90",
                )}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <div className="glass flex items-center gap-1 rounded-2xl rounded-bl-md px-4 py-3">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="h-2 w-2 rounded-full bg-white/60"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action chip from the agent's tool use */}
        {action.type === "update_route" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <Link
              href={`/route?venueId=${action.venueId}&matchId=${matchId}&mode=transit`}
              className="pressable inline-flex items-center gap-2 rounded-full bg-electric-400/20 px-4 py-2 text-sm font-semibold text-electric-200"
            >
              <Navigation className="h-4 w-4" /> Open route plan
            </Link>
          </motion.div>
        )}
        {action.type === "call_venue" && venue?.phone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <a
              href={`tel:${venue.phone}`}
              className="pressable inline-flex items-center gap-2 rounded-full bg-pitch-400/20 px-4 py-2 text-sm font-semibold text-pitch-200"
            >
              <Phone className="h-4 w-4" /> Call {venue.name}
            </a>
          </motion.div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input dock */}
      <div className="fixed inset-x-0 bottom-[5.25rem] z-40 mx-auto w-full max-w-[440px] px-4">
        {messages.length <= 1 && (
          <div className="-mx-4 mb-2 flex gap-2 overflow-x-auto px-4 hide-scrollbar">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="pressable shrink-0 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white/70 hover:bg-white/10"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="glass-strong flex items-center gap-2 rounded-2xl p-1.5 pl-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this venue…"
            className="w-full bg-transparent text-sm placeholder:text-white/35 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send"
            className="pressable grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-pitch-400 to-emerald-600 text-white disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
