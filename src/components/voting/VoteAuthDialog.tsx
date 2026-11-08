"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Mail,
  Loader2,
  ShieldCheck,
  ArrowRight,
  MailCheck,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtpAction } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { checkEmailTypo } from "@/lib/auth/email";
import { toast } from "sonner";

interface VoteAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  nomineeName?: string;
  categoryName?: string;
  categorySlug?: string;
  nomineeId?: string;
}

export function VoteAuthDialog({
  open,
  onOpenChange,
  onVerified,
  nomineeName,
  categoryName,
  categorySlug,
  nomineeId,
}: VoteAuthDialogProps) {
  const pathname = usePathname();
  const [step, setStep] = useState<"email" | "sent">("email");
  const [email, setEmail] = useState("");
  const [suggestedEmail, setSuggestedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Typo check on email
  useEffect(() => {
    const fix = checkEmailTypo(email);
    setSuggestedEmail(fix);
  }, [email]);

  // Reset dialog state on close
  useEffect(() => {
    if (!open) {
      setErrorMessage(null);
    }
  }, [open]);

  // Active listener & poller when in "sent" state:
  // If the voter clicks the magic link in another tab or app,
  // detect the session immediately and confirm their vote!
  useEffect(() => {
    if (!open || step !== "sent") return;

    const supabase = createClient();
    let isMounted = true;

    // Check current session
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && isMounted) {
        toast.success("Identity verified! Confirming your vote...");
        onOpenChange(false);
        onVerified();
      }
    };

    checkUser();

    // Listen for auth state change
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && isMounted) {
        toast.success("Identity verified! Confirming your vote...");
        onOpenChange(false);
        onVerified();
      }
    });

    // Fast interval polling fallback (every 2.5s) while dialog is open
    const pollInterval = setInterval(checkUser, 2500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      subscription.unsubscribe();
    };
  }, [open, step, onOpenChange, onVerified]);

  // Send Magic Link
  const handleSendMagicLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (countdown > 0) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Build smart return URL preserving the user's vote intent
      const returnPath =
        categorySlug && nomineeId
          ? `/vote/${categorySlug}?auto_vote=1&selected_nominee=${nomineeId}`
          : pathname;

      const result = await sendOtpAction(email, undefined, returnPath);

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
          setErrorMessage(result.error || "Failed to send magic link. Please try again.");
          if (result.suggestedEmail) {
            setSuggestedEmail(result.suggestedEmail);
          }
        }
      }
    } catch {
      setErrorMessage("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0a0a0a] border border-white/10 text-white p-6 sm:p-7 rounded-3xl shadow-2xl">
        <DialogHeader className="text-left space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 mb-2 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            {step === "email" ? (
              <Mail className="w-6 h-6" />
            ) : (
              <MailCheck className="w-6 h-6 text-emerald-400" />
            )}
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
            {step === "email" ? "Verify Your Email to Vote" : "Check Your Inbox"}
          </DialogTitle>

          <DialogDescription className="text-white/60 text-xs sm:text-sm leading-relaxed">
            {step === "email" ? (
              <>
                To ensure a fair competition (
                <strong className="text-white font-semibold">one verified voter = one vote</strong>
                ), enter your email below. We&apos;ll send you a 1-click magic sign-in link.
                {nomineeName && categoryName && (
                  <span className="block mt-2 text-amber-400 font-semibold text-xs font-mono">
                    Voting for: {nomineeName} ({categoryName})
                  </span>
                )}
              </>
            ) : (
              <>
                We sent a 1-click sign-in link to{" "}
                <strong className="text-white font-mono">{email}</strong>. Tap the link in your email
                and your vote will be counted instantly.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Cooldown Notice */}
        {countdown > 0 && step === "email" && (
          <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center gap-2.5 text-xs text-amber-300">
            <Clock className="w-4 h-4 shrink-0 animate-pulse text-amber-400" />
            <div className="flex-1">
              <span>Security cooldown active. You can request another link in </span>
              <strong className="text-white font-mono font-bold text-sm">{countdown}s</strong>
            </div>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs leading-relaxed"
          >
            {errorMessage}
          </div>
        )}

        {/* STEP 1: EMAIL INPUT */}
        {step === "email" ? (
          <form onSubmit={handleSendMagicLink} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="voter-email" className="text-xs uppercase tracking-wider text-white/60 font-semibold">
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
                autoFocus
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-amber-400 text-sm"
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
                No password or codes required. Fast 1-click email verification.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email || countdown > 0}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-bold h-12 rounded-xl text-sm transition-all focus-visible:ring-2 focus-visible:ring-amber-400 shadow-lg shadow-amber-400/10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Magic Link...
                </>
              ) : countdown > 0 ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-pulse" />
                  Please wait ({countdown}s)
                </>
              ) : (
                <>
                  Send Magic Link
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        ) : (
          /* STEP 2: LINK SENT NOTIFICATION */
          <div className="space-y-5 mt-2">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-white">
                  Waiting for verification...
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Open your email app, tap the <strong className="text-white">Log In / Verify</strong> button,
                and this window will confirm your vote automatically.
              </p>
            </div>

            {nomineeName && (
              <div className="p-3.5 rounded-xl bg-amber-400/[0.08] border border-amber-400/20 text-xs font-mono text-amber-300 flex items-center justify-between">
                <span>Pending vote for:</span>
                <strong className="text-white">{nomineeName}</strong>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 text-xs text-white/60">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setErrorMessage(null);
                }}
                className="hover:text-white underline underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
              >
                Use different email
              </button>

              <button
                type="button"
                onClick={() => handleSendMagicLink()}
                disabled={isLoading || countdown > 0}
                className="flex items-center gap-1.5 hover:text-white underline underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded disabled:opacity-40 disabled:no-underline font-medium"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : countdown > 0 ? (
                  <span className="font-mono text-amber-400">Resend in {countdown}s</span>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Resend magic link
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/40 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>One-voter-one-vote verified elections</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
