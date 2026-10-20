"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Mail, Ticket, Loader2, Search, ArrowRight, Download, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { lookupGuestTicketsAction } from "@/app/actions/tickets";
import { toast } from "sonner";

export function MyTicketsClient() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
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
          toast.info("No tickets found for this email.");
        } else {
          toast.success(`Found ${res.tickets.length} ticket(s)!`);
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
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-4">
          <Ticket className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-3">
          Retrieve My Tickets
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Enter the email address you used during guest checkout to instantly view and re-download your QR passes.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1220]/90 border border-amber-500/20 shadow-xl backdrop-blur-xl">
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lookup-email" className="text-xs uppercase tracking-wider text-slate-300">
              Purchase Email Address
            </Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                id="lookup-email"
                type="email"
                placeholder="e.g. salim@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 focus-visible:ring-amber-500/50"
              />
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold h-12 px-6 rounded-xl shrink-0"
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
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Results */}
      {hasSearched && !isLoading && (
        <div className="space-y-6">
          {tickets.length === 0 ? (
            <div className="text-center py-16 border border-white/5 rounded-2xl bg-white/[0.01]">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Tickets Found</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                We couldn&apos;t find any confirmed ticket orders under <strong>{email}</strong>. Check for typos or search with a different email.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-xs uppercase tracking-wider text-amber-400 font-mono font-bold">
                Found {tickets.length} Verified Ticket(s)
              </div>

              {tickets.map((t, idx) => (
                <div
                  key={t.id}
                  className="p-6 sm:p-8 rounded-3xl bg-[#0e1627] border-2 border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
                >
                  <div className="space-y-3 text-center md:text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      {t.ticket_tiers?.name || "General Pass"} • Ticket #{idx + 1}
                    </span>
                    <h3 className="text-2xl font-extrabold text-white uppercase">
                      Coastal Nganya Awards Night
                    </h3>
                    <div className="text-xs text-slate-400 space-y-1 font-mono">
                      <div>Code: <span className="text-amber-400 font-bold tracking-widest">{t.ticket_code}</span></div>
                      <div>Status: <span className={t.status === "valid" ? "text-emerald-400 font-bold uppercase" : "text-slate-400 uppercase"}>{t.status}</span></div>
                      <div>Venue: Mombasa Cement Grounds, Mombasa</div>
                      <div>Date: Saturday, Dec 6, 2025 • 6:00 PM EAT</div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0 text-center">
                    {qrMap[t.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrMap[t.id]}
                        alt="Ticket QR Code"
                        width={180}
                        height={180}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="w-[180px] h-[180px] flex items-center justify-center text-slate-400 text-xs">
                        QR Code
                      </div>
                    )}
                    <div className="text-[10px] text-slate-600 font-mono font-bold mt-1 tracking-wider uppercase">
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
