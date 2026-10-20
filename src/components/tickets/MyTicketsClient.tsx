"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Ticket, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { lookupGuestTicketsAction } from "@/app/actions/tickets";
import { toast } from "sonner";

interface TicketData {
  id: string;
  ticket_code: string;
  status: string;
  qr_payload: string;
  ticket_tiers?: {
    name: string;
  };
}

export function MyTicketsClient() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await lookupGuestTicketsAction(email);
      if (res.success && res.tickets) {
        setTickets(res.tickets);

        // Generate QR codes for the fetched tickets
        const map: Record<string, string> = {};
        for (const t of res.tickets) {
          const url = await QRCode.toDataURL(t.qr_payload || t.ticket_code, {
            width: 240,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
          });
          map[t.id] = url;
        }
        setQrMap(map);

        if (res.tickets.length === 0) {
          toast.info("No tickets found for this email address");
        } else {
          toast.success(`Found ${res.tickets.length} ticket(s)`);
        }
      } else {
        setErrorMessage(res.error || "Failed to find tickets.");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Search Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mx-auto mb-4">
          <Ticket className="w-5 h-5" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-3">
          Retrieve My Tickets
        </h1>
        <p className="text-white/50 text-sm leading-relaxed">
          Enter the email address you used during checkout to instantly access and save your entry passes.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0a0a]/95 border border-white/10 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lookup-email" className="text-xs uppercase tracking-wider text-white/60">
              Purchase Email Address
            </Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                id="lookup-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 focus-visible:ring-2 focus-visible:ring-white"
              />
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="bg-white hover:bg-white/90 text-black font-semibold h-12 px-6 rounded-xl shrink-0 focus-visible:ring-2 focus-visible:ring-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find Tickets
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {errorMessage && (
          <div role="alert" className="mt-4 p-3 rounded-xl bg-white/5 border border-white/20 text-white text-xs">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Results */}
      {hasSearched && !isLoading && (
        <div className="space-y-6">
          {tickets.length === 0 ? (
            <div className="text-center py-16 border border-white/5 rounded-2xl bg-white/[0.01]">
              <Ticket className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Tickets Found</h3>
              <p className="text-sm text-white/40 max-w-sm mx-auto">
                We could not find any confirmed tickets under <strong>{email}</strong>. Check for typos or search with a different email address.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-xs uppercase tracking-wider text-white/60 font-mono font-semibold">
                Found {tickets.length} Verified Ticket(s)
              </div>

              {tickets.map((t, idx) => (
                <div
                  key={t.id}
                  className="p-6 sm:p-8 rounded-3xl bg-[#0a0a0a] border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
                >
                  <div className="space-y-3 text-center md:text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold uppercase tracking-wider">
                      {t.ticket_tiers?.name || "General Pass"} • Pass #{idx + 1}
                    </span>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
                      Coastal Nganya Awards Night
                    </h3>
                    <div className="text-xs text-white/50 space-y-1 font-mono">
                      <div>Code: <span className="text-white font-bold tracking-widest">{t.ticket_code}</span></div>
                      <div>Status: <span className="text-white font-semibold uppercase">{t.status}</span></div>
                      <div>Venue: Mombasa Cement Grounds, Mombasa</div>
                      <div>Date: Sunday, Dec 6, 2026 • 6:00 PM EAT</div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0 text-center">
                    {qrMap[t.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrMap[t.id]}
                        alt={`Entry QR Code for pass ${t.ticket_code}`}
                        width={180}
                        height={180}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="w-[180px] h-[180px] flex items-center justify-center text-black text-xs font-mono">
                        QR Code
                      </div>
                    )}
                    <div className="text-[10px] text-black font-mono font-bold mt-1 tracking-wider uppercase">
                      Gate Entry Pass
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
