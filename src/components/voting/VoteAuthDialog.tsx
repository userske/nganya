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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

  // Sign in with Google (OAuth — 0 emails sent, instant verification)
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const returnPath =
        categorySlug && nomineeId
          ? `/vote/${categorySlug}?auto_vote=1&selected_nominee=${nomineeId}`
          : pathname;

      const origin = window.location.origin;
      const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(returnPath)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        if (error.message?.toLowerCase().includes("not enabled")) {
          setErrorMessage("Google Sign-In is being activated in Supabase settings. Please use the email magic link below in the meantime.");
        } else {
          setErrorMessage(error.message);
        }
      }
    } catch {
      setErrorMessage("Unable to connect to Google Sign-In. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

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

        {/* STEP 1: AUTH OPTIONS */}
        {step === "email" ? (
          <div className="space-y-4 mt-2">
            {/* Google 1-Tap / OAuth Button */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full bg-white hover:bg-neutral-100 text-neutral-900 font-bold h-12 rounded-xl text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-white/5 border border-white/20 active:scale-[0.99]"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-700" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-5 h-5 shrink-0" />
                  <span>Continue with Google</span>
                </>
              )}
            </Button>

            {/* Visual Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-[#0a0a0a] px-3 text-white/40 font-mono">Or vote via email link</span>
              </div>
            </div>

            <form onSubmit={handleSendMagicLink} className="space-y-4">
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
                disabled={isLoading || isGoogleLoading || !email || countdown > 0}
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
          </div>
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
