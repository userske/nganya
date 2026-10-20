"use client";

import { useState } from "react";
import { Check, Ticket, ShieldCheck, CreditCard, Smartphone, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createTicketCheckoutAction } from "@/app/actions/tickets";
import { toast } from "sonner";

interface TicketTier {
  id: string;
  name: string;
  description: string | null;
  price_kes: number;
  capacity: number;
  sold_count: number;
  perks: string[];
  is_active: boolean;
}

interface TicketCheckoutClientProps {
  tiers: TicketTier[];
}

export function TicketCheckoutClient({ tiers }: TicketCheckoutClientProps) {
  const [selectedTierId, setSelectedTierId] = useState<string>(tiers[0]?.id || "");
  const [quantity, setQuantity] = useState<number>(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedTier = tiers.find((t) => t.id === selectedTierId) || tiers[0];
  const totalPriceKes = (selectedTier?.price_kes || 0) * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await createTicketCheckoutAction({
        tierId: selectedTier.id,
        quantity,
        buyerName,
        buyerEmail,
        buyerPhone,
      });

      if (res.success && res.checkoutUrl) {
        toast.info("Connecting to checkout...", {
          description: "Select M-Pesa or Card to complete payment.",
        });
        window.location.href = res.checkoutUrl;
      } else {
        setErrorMessage(res.error || "Failed to start checkout. Please try again.");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDownTier = (e: React.KeyboardEvent, tierId: string, isSoldOut: boolean) => {
    if (isSoldOut) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setSelectedTierId(tierId);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Tiers Column */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight mb-2">
            1. Select Your Ticket Tier
          </h2>
          <p className="text-sm text-white/50">
            Choose your admission experience. All passes include access to the main awards arena.
          </p>
        </div>

        <div role="radiogroup" aria-label="Ticket Tiers" className="space-y-4">
          {tiers.map((tier) => {
            const isSelected = selectedTierId === tier.id;
            const remaining = Math.max(0, tier.capacity - tier.sold_count);
            const isSoldOut = remaining <= 0;

            return (
              <div
                key={tier.id}
                role="radio"
                aria-checked={isSelected}
                aria-disabled={isSoldOut}
                tabIndex={isSoldOut ? -1 : 0}
                onClick={() => !isSoldOut && setSelectedTierId(tier.id)}
                onKeyDown={(e) => handleKeyDownTier(e, tier.id, isSoldOut)}
                className={`relative p-6 rounded-2xl transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out border text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.99] select-none ${
                  isSoldOut
                    ? "bg-white/[0.01] border-white/5 opacity-40 cursor-not-allowed"
                    : isSelected
                    ? "bg-white/[0.06] border-white shadow-[0_4px_24px_rgba(255,255,255,0.06)] cursor-pointer"
                    : "bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.04] cursor-pointer"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-white/50 mt-0.5">{tier.description}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-2xl font-black text-white font-mono">
                      KES {tier.price_kes.toLocaleString()}
                    </span>
                    <span className="text-xs text-white/40 block">per ticket</span>
                  </div>
                </div>

                {/* Perks List */}
                {tier.perks && tier.perks.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
                    {tier.perks.map((perk, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                        <Check className="w-3.5 h-3.5 text-white shrink-0" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Remaining stock badge */}
                <div className="mt-4 flex items-center justify-between text-xs">
                  {isSoldOut ? (
                    <Badge variant="outline" className="text-[10px] uppercase border-white/20 text-white/40">
                      Sold Out
                    </Badge>
                  ) : (
                    <span className="text-white/50 font-mono text-[11px]">
                      {remaining} spots available
                    </span>
                  )}
                  {isSelected && (
                    <span className="text-white font-semibold text-xs uppercase flex items-center gap-1">
                      Selected Tier &check;
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkout Form Column */}
      <div className="lg:col-span-5">
        <div className="sticky top-28 p-6 sm:p-8 rounded-3xl bg-[#0a0a0a]/95 border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
            <Ticket className="w-5 h-5 text-white/70" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              2. Guest Checkout
            </h2>
          </div>

          {errorMessage && (
            <div role="alert" className="mb-6 p-3 rounded-xl bg-white/5 border border-white/20 text-white text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quantity Picker */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-white/60">
                Number of Tickets
              </Label>
              <div className="flex items-center gap-2" role="group" aria-label="Ticket Quantity">
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    aria-pressed={quantity === num}
                    onClick={() => setQuantity(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-[background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      quantity === num
                        ? "bg-white text-black font-bold shadow-sm"
                        : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Buyer Name */}
            <div className="space-y-1.5">
              <Label htmlFor="buyer-name" className="text-xs uppercase tracking-wider text-white/60">
                Full Name
              </Label>
              <Input
                id="buyer-name"
                autoComplete="name"
                placeholder="e.g. Salim Omar"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 focus-visible:ring-2 focus-visible:ring-white"
              />
            </div>

            {/* Buyer Email */}
            <div className="space-y-1.5">
              <Label htmlFor="buyer-email" className="text-xs uppercase tracking-wider text-white/60">
                Email Address (Tickets delivered here)
              </Label>
              <Input
                id="buyer-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 focus-visible:ring-2 focus-visible:ring-white"
              />
            </div>

            {/* Buyer Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="buyer-phone" className="text-xs uppercase tracking-wider text-white/60">
                Phone Number (For M-Pesa prompt)
              </Label>
              <Input
                id="buyer-phone"
                type="tel"
                autoComplete="tel"
                placeholder="e.g. 0712345678"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 focus-visible:ring-2 focus-visible:ring-white"
              />
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-white/50">
                <span>{selectedTier.name} &times; {quantity}</span>
                <span className="font-mono text-white">KES {totalPriceKes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Service & Processing Fee</span>
                <span className="font-mono text-white/80">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/5">
                <span>Total Due</span>
                <span className="font-mono text-white text-lg">
                  KES {totalPriceKes.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !buyerName || !buyerEmail || !buyerPhone}
              className="w-full mt-6 bg-white hover:bg-white/90 text-black font-semibold text-sm h-12 rounded-xl shadow-lg transition-[opacity,transform] duration-150 ease-out active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting to checkout...
                </>
              ) : (
                <>
                  Pay KES {totalPriceKes.toLocaleString()} via Paystack
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          {/* Payment Badges */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40 font-mono">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-white/60" />
              <span>M-Pesa STK</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-white/60" />
              <span>Card</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-white/60" />
              <span>SSL Secured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
