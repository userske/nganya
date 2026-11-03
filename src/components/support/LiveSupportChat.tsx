"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Headphones,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Mail,
  HelpCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  link?: {
    label: string;
    href: string;
  };
  timestamp: string;
}

const QUICK_TOPICS = [
  {
    label: "Rate Limit / Wait Time",
    query: "Why am I getting a rate limit error?",
  },
  {
    label: "Voting Not Working",
    query: "Voting is not working for me",
  },
  {
    label: "Where are my tickets?",
    query: "Where can I find my tickets and QR code?",
  },
  {
    label: "How to pay via M-Pesa",
    query: "How do I pay with M-Pesa?",
  },
  {
    label: "Didn't receive email",
    query: "I didn't receive my magic link sign-in email",
  },
  {
    label: "Can I change my vote?",
    query: "Can I change or edit my vote after submitting?",
  },
  {
    label: "Event date & venue",
    query: "When and where is the event taking place?",
  },
  {
    label: "Speak with a human",
    query: "I need to talk to human support",
  },
];

function getBotReply(rawQuery: string): { text: string; link?: { label: string; href: string } } {
  const q = rawQuery.toLowerCase();

  // 1. Rate Limit / Cooldown
  if (
    q.includes("rate limit") ||
    q.includes("wait") ||
    q.includes("cooldown") ||
    q.includes("60 second") ||
    q.includes("seconds") ||
    q.includes("too many") ||
    q.includes("slow down")
  ) {
    return {
      text: "To protect the voting platform and attendees from spam, our security system enforces a 60-second cooldown between email sign-in requests. Please wait for the on-screen countdown timer to reach zero, then tap resend once. Also be sure to check your Spam or Junk folder for the previous link.",
      link: { label: "Go to Sign In Page", href: "/login" },
    };
  }

  // 2. Voting Not Working / Can't Vote
  if (
    q.includes("voting") ||
    q.includes("vote") ||
    q.includes("can't vote") ||
    q.includes("cant vote") ||
    q.includes("not working") ||
    q.includes("cast") ||
    q.includes("ballot")
  ) {
    return {
      text: "Here is how to ensure your vote is counted:\n\n1. Sign in with your active email (one verified email = one vote per category).\n2. If you already voted in that specific category, your choice is locked to prevent double voting.\n3. Make sure cookies are enabled on your browser.\n4. You can explore all 61 categories freely from the categories directory.",
      link: { label: "Open Categories Ballot", href: "/vote" },
    };
  }

  // 3. Tickets / Gate Passes / QR Codes
  if (
    q.includes("ticket") ||
    q.includes("pass") ||
    q.includes("passes") ||
    q.includes("qr") ||
    q.includes("code") ||
    q.includes("gate") ||
    q.includes("admit") ||
    q.includes("entry")
  ) {
    return {
      text: "All purchased gate passes are tied to your checkout email. You can view, download, and print your scannable gate QR codes anytime inside your account portal. Simply enter your email to view your digital wallet passes.",
      link: { label: "View My Tickets & Passes", href: "/my-account" },
    };
  }

  // 4. M-Pesa / Payment / Paystack
  if (
    q.includes("mpesa") ||
    q.includes("m-pesa") ||
    q.includes("pay") ||
    q.includes("payment") ||
    q.includes("paystack") ||
    q.includes("cost") ||
    q.includes("price") ||
    q.includes("buy")
  ) {
    return {
      text: "We accept M-Pesa and all major debit/credit cards securely via Paystack.\n\nTicket tiers:\n• Regular Pass: KES 500\n• VIP Lounge Pass: KES 3,500\n• VVIP Table of 5: KES 30,000\n\nWhen you click 'Proceed to Checkout', select M-Pesa and enter your phone number. You will receive an instant STK push prompt on your handset to enter your M-Pesa PIN.",
      link: { label: "Buy Official Passes", href: "/tickets" },
    };
  }

  // 5. Email not received / Magic link missing
  if (
    q.includes("email") ||
    q.includes("link") ||
    q.includes("magic") ||
    q.includes("inbox") ||
    q.includes("spam") ||
    q.includes("junk") ||
    q.includes("didn't receive") ||
    q.includes("didnt receive")
  ) {
    return {
      text: "If your sign-in link has not arrived yet:\n\n1. Check your Spam, Junk, or Promotions folder.\n2. Ensure there are no typos in your email (e.g. gmail.com instead of gmial.com).\n3. Wait for the 60-second cooldown timer before requesting another link.\n4. Magic links remain valid for 1 full hour after sending.",
      link: { label: "Try Signing In Again", href: "/login" },
    };
  }

  // 6. Can I change my vote?
  if (
    q.includes("change") ||
    q.includes("edit") ||
    q.includes("switch") ||
    q.includes("mistake") ||
    q.includes("undo")
  ) {
    return {
      text: "To ensure 100% election integrity and prevent tampering, cast votes are cryptographically locked immediately upon verification. Once submitted, a vote cannot be altered or re-cast. You may however cast separate votes in any of the remaining 60 award categories.",
      link: { label: "Browse Remaining Categories", href: "/vote" },
    };
  }

  // 7. Event Date, Time, Venue
  if (
    q.includes("date") ||
    q.includes("venue") ||
    q.includes("location") ||
    q.includes("where") ||
    q.includes("when") ||
    q.includes("time") ||
    q.includes("mamba") ||
    q.includes("mombasa")
  ) {
    return {
      text: "The Coastal Nganya Awards Night will take place on:\n\n• Date: Sunday, December 6, 2026\n• Time: Gates open at 2:00 PM EAT\n• Venue: Mamba Village, Nyali / Mombasa, Kenya\n\nPlease arrive with your digital QR pass downloaded on your phone or printed.",
      link: { label: "Event Details & Tickets", href: "/tickets" },
    };
  }

  // 8. Human Support / Escalation
  if (
    q.includes("human") ||
    q.includes("agent") ||
    q.includes("person") ||
    q.includes("talk") ||
    q.includes("call") ||
    q.includes("whatsapp") ||
    q.includes("contact") ||
    q.includes("help") ||
    q.includes("support")
  ) {
    return {
      text: "Our executive support desk is available to assist you directly.\n\n• Official Email: info@coastalnganyaawards.com\n• Hours: Monday - Sunday, 8:00 AM - 10:00 PM EAT\n\nFor urgent gate pass inquiries or corporate table reservations, email us and an operations officer will reply within 30 minutes.",
      link: { label: "Email Support Team", href: "mailto:info@coastalnganyaawards.com" },
    };
  }

  // Default Fallback
  return {
    text: "Thank you for reaching out to Coastal Nganya Awards Support. We can assist with voting questions, rate limit timers, ticket purchases, or venue details. Please select one of the common topics below or email our team directly at info@coastalnganyaawards.com.",
    link: { label: "Contact Official Support", href: "mailto:info@coastalnganyaawards.com" },
  };
}

export function LiveSupportChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-1",
      sender: "bot",
      text: "Hello. Welcome to Coastal Nganya Awards Live Support. How can we assist you today? Choose a common question below or type your issue.",
      timestamp: "Just now",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendQuery = (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate realistic typing response delay
    setTimeout(() => {
      const reply = getBotReply(trimmed);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: reply.text,
        link: reply.link,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendQuery(inputValue);
  };

  if (pathname !== "/") {
    return null;
  }

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. COMPACT CHAT ICON (Homepage Only - expands on click)
      ───────────────────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open Live Support Chat"
          title="Live Support Chat"
          className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-[#0a0a0a] hover:bg-neutral-900 text-amber-400 border border-amber-400/40 hover:border-amber-400 shadow-[0_10px_30px_rgba(0,0,0,0.85),0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black animate-pulse" />
          </div>
        </button>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. SUPPORT CHAT MODAL / DRAWER (Expands from icon)
      ───────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Live Support Chat Window"
          className="fixed bottom-5 right-5 z-50 w-[94vw] max-w-[400px] h-[560px] max-h-[85vh] rounded-3xl bg-[#0c0c0c] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.15)] flex flex-col overflow-hidden backdrop-blur-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-200 origin-bottom-right"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#141414] via-[#101010] to-[#0a0a0a] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                    Awards Help Desk
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-white/50 font-mono">
                  Online · Instant Answers
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              aria-label="Close Support Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-amber-400 text-black font-medium rounded-br-none"
                      : "bg-[#181818] text-white/90 border border-white/10 rounded-bl-none shadow-md"
                  }`}
                >
                  {m.text}

                  {m.link && (
                    <div className="mt-2.5 pt-2 border-t border-white/10">
                      <Link
                        href={m.link.href}
                        onClick={() => {
                          if (!m.link?.href.startsWith("mailto:")) {
                            setIsOpen(false);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        {m.link.label}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-white/30 font-mono mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-[#181818] border border-white/10 w-fit text-white/50 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Typing answer...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Chips Strip */}
          <div className="p-2.5 bg-black/60 border-t border-white/5">
            <p className="text-[10px] uppercase font-mono tracking-wider text-white/40 mb-1.5 px-1">
              Common Questions
            </p>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_TOPICS.map((topic, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendQuery(topic.query)}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-white/5 hover:bg-amber-400/20 text-white/70 hover:text-amber-300 border border-white/10 hover:border-amber-400/30 whitespace-nowrap transition-colors shrink-0"
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-[#111111] border-t border-white/10 flex items-center gap-2"
          >
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question (rate limit, tickets, votes)..."
              disabled={isTyping}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-amber-400"
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              size="sm"
              className="bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-bold h-10 w-10 p-0 rounded-xl shrink-0"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
