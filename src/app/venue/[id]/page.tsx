"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MOCK_MATCHES, MOCK_VENUES } from "@/lib/mock-data";
import type { ConciergeMessage } from "@/lib/types";

export default function VenueDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-400">Loading…</div>
        </div>
      }
    >
      <VenueDetailContent />
    </Suspense>
  );
}

function VenueDetailContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("matchId") ?? MOCK_MATCHES[0]?.id;

  const venue = MOCK_VENUES.find((v) => v.id === id);

  const [messages, setMessages] = useState<ConciergeMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!venue) return;
    setMessages([
      {
        role: "assistant",
        content: `Hey! I'm your FIFA 360 concierge for ${venue.name}. Ask me anything — best seats, what to order, getting there by transit, parking, or anything else!`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [venue]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ConciergeMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages, venueId: id, matchId }),
      });
      const { reply } = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: reply, timestamp: new Date().toISOString() },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Try again!",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!venue) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-gray-400">Venue not found</div>
      </div>
    );
  }

  return (
    <div className="page-enter flex flex-col h-[calc(100vh-var(--bottom-nav-height))]">
      <div className="bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="page-container pt-10 pb-3">
          <div className="flex items-center gap-3">
            <Link href="/venue" className="text-gray-400 hover:text-white text-lg">
              ←
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold truncate">{venue.name}</h1>
              <p className="text-xs text-gray-400 truncate">{venue.address}</p>
            </div>
            {venue.rsvpAvailable && matchId && (
              <button
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("open-voice-modal", { detail: { venueId: id, matchId } }),
                  )
                }
                className="text-sm py-1.5 px-3 rounded-xl bg-green-700 hover:bg-green-600 font-semibold transition-colors shrink-0"
              >
                📞 Book
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="page-container py-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl text-sm fade-in ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-gray-800 text-gray-100 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="bg-gray-900 border-t border-gray-800 shrink-0">
        <div className="page-container py-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask about parking, atmosphere, drinks..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition-colors font-semibold text-sm"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-600 text-center mt-1">FIFA 360 Concierge · Demo Build</p>
        </div>
      </div>
    </div>
  );
}
