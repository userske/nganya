"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Mail, Loader2, ShieldCheck, ArrowRight, MailCheck, RefreshCw, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtpAction } from "@/app/actions/auth";
import { checkEmailTypo } from "@/lib/auth/email";
import { toast } from "sonner";

interface VoteAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  nomineeName?: string;
  categoryName?: string;
}

export function VoteAuthDialog({
  open,
  onOpenChange,
  nomineeName,
  categoryName,
}: VoteAuthDialogProps) {
  const pathname = usePathname();
  const [step, setStep] = useState<"email" | "sent">("email");
  const [email, setEmail] = useState("");
  const [suggestedEmail, setSuggestedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // Countdown timer: ticks down every second
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  useEffect(() => {
    const fix = checkEmailTypo(email);
    setSuggestedEmail(fix);
  }, [email]);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (countdown > 0) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await sendOtpAction(email, undefined, pathname);
      if (result.success) {
        setStep("sent");
        setCountdown(60);
        toast.success("Magic link sent!", {
          description: `Check your inbox at ${email}`,
        });
      } else {
        if (result.rateLimited) {
          const waitTime = result.retryAfterSeconds || 60;
          setCountdown(waitTime);
          setErrorMessage(null);
          toast.info(`Please wait ${waitTime}s before requesting another link.`);
        } else {
          setErrorMessage(result.error || "Failed to send link. Please try again.");
          if (result.suggestedEmail) {
            setSuggestedEmail(result.suggestedEmail);
          }
        }
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const result = await sendOtpAction(email, undefined, pathname);
      if (result.success) {
        setCountdown(60);
        toast.success("Link resent!", { description: `Check your inbox at ${email}` });
      } else {
        if (result.rateLimited) {
          const waitTime = result.retryAfterSeconds || 60;
          setCountdown(waitTime);
          setErrorMessage(null);
          toast.info(`Please wait ${waitTime}s before requesting another link.`);
        } else {
          setErrorMessage(result.error || "Failed to resend.");
        }
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0a0a0a] border border-white/10 text-white p-6 rounded-3xl shadow-2xl">
        <DialogHeader className="text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            {step === "email" ? <Mail className="w-6 h-6" /> : <MailCheck className="w-6 h-6 text-emerald-400" />}
          </div>
          <DialogTitle className="text-xl font-bold text-white tracking-tight">
            {step === "email" ? "Verify Your Email to Vote" : "Check Your Inbox"}
          </DialogTitle>
          <DialogDescription className="text-white/50 text-sm">
            {step === "email" ? (
              <>
                To ensure a fair competition (<strong>one verified voter = one vote per category</strong>), please verify your email. No passwords needed.
                {nomineeName && categoryName && (
                  <span className="block mt-2 text-amber-400 font-semibold text-xs">
                    Voting for: {nomineeName} in {categoryName}
                  </span>
                )}
              </>
            ) : (
              <>
                We sent a sign-in link to{" "}
                <span className="text-white font-medium">{email}</span>.{" "}
                Click the link in your email to verify and cast your vote.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Live Countdown Cooldown Notice */}
        {countdown > 0 && (
          <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center gap-2.5 text-xs text-amber-300">
            <Clock className="w-4 h-4 shrink-0 animate-pulse text-amber-400" />
            <div className="flex-1">
              <span>Security cooldown active. You can request another link in </span>
              <strong className="text-white font-mono font-bold text-sm">{countdown}s</strong>
            </div>
          </div>
        )}

        {errorMessage && (
          <div role="alert" className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs leading-relaxed">
            {errorMessage}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleSendLink} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="voter-email" className="text-xs uppercase tracking-wider text-white/60">
                Your Email Address
              </Label>
              <Input
                id="voter-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-amber-400"
              />

              {/* Typo Suggestion Chip */}
              {suggestedEmail && (
                <div className="p-2.5 rounded-lg bg-amber-400/10 border border-amber-400/25 flex items-center justify-between text-xs">
                  <span className="text-amber-300">
                    Did you mean <strong className="text-white">{suggestedEmail}</strong>?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(suggestedEmail);
                      setSuggestedEmail(null);
                      setErrorMessage(null);
                    }}
                    className="text-black bg-amber-400 hover:bg-amber-300 font-bold px-2 py-0.5 rounded text-[11px] transition-colors"
                  >
                    Apply Fix
                  </button>
                </div>
              )}

              <p className="text-[11px] text-white/40">
                You will only verify once for the entire awards season.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email || countdown > 0}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-bold h-11 rounded-xl transition-[background-color,color] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending link...
                </>
              ) : countdown > 0 ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-pulse" />
                  Please wait ({countdown}s)
                </>
              ) : (
                <>
                  Send Sign-In Link
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 mt-2">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center space-y-1">
              <p className="text-white text-sm font-semibold">Link sent to</p>
              <p className="text-white/80 text-sm font-mono truncate">{email}</p>
              <p className="text-white/40 text-xs mt-2 leading-relaxed">
                Open your email app and click <strong className="text-white/70">Sign in to Coastal Nganya Awards</strong>. The link expires in 1 hour.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-white/50">
              <button
                type="button"
                onClick={() => { setStep("email"); setErrorMessage(null); }}
                className="hover:text-white underline underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
              >
                Use different email
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading || countdown > 0}
                className="flex items-center gap-1.5 hover:text-white underline underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded disabled:opacity-40 disabled:no-underline"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : countdown > 0 ? (
                  <span className="font-mono text-amber-400">Resend in {countdown}s</span>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Resend link
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/40 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>One-click voter verification</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
