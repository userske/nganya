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
  KeyRound,
  CheckCircle2,
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
import { sendOtpAction, verifyOtpAction } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
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
  onVerified,
  nomineeName,
  categoryName,
}: VoteAuthDialogProps) {
  const pathname = usePathname();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [suggestedEmail, setSuggestedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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

  // Reset state when dialog is closed/opened
  useEffect(() => {
    if (!open) {
      setErrorMessage(null);
      setOtpCode("");
    }
  }, [open]);

  // 1. Send OTP / Magic link
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (countdown > 0) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await sendOtpAction(email, undefined, pathname);
      if (result.success) {
        setStep("code");
        setCountdown(60);
        toast.success("Verification code sent!", {
          description: `Check your inbox at ${email}`,
        });
      } else {
        if (result.rateLimited) {
          const waitTime = result.retryAfterSeconds || 60;
          setCountdown(waitTime);
          setErrorMessage(null);
          toast.info(`Please wait ${waitTime}s before requesting another code.`);
        } else {
          setErrorMessage(result.error || "Failed to send code. Please try again.");
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

  // 2. Verify 6-digit OTP code directly in browser
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = otpCode.trim();
    if (!cleanToken || cleanToken.length < 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setErrorMessage(null);
    setIsVerifying(true);

    try {
      const supabase = createClient();

      // Verify OTP on browser client so session is written directly to current browser cookies
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: cleanToken,
        type: "email",
      });

      if (error || !data.user) {
        setErrorMessage(
          error?.message?.includes("expired")
            ? "Verification code has expired. Please request a new one."
            : "Invalid verification code. Please check your email or click resend."
        );
        setIsVerifying(false);
        return;
      }

      // Also ensure server-side profile role synchronization
      try {
        await verifyOtpAction(email, cleanToken);
      } catch {
        // Non-blocking if client session is already active
      }

      toast.success("Identity verified successfully!");
      onOpenChange(false);
      onVerified();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to verify code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // 3. Resend OTP code
  const handleResend = async () => {
    if (countdown > 0) return;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const result = await sendOtpAction(email, undefined, pathname);
      if (result.success) {
        setCountdown(60);
        toast.success("New code sent!", { description: `Check your inbox at ${email}` });
      } else {
        if (result.rateLimited) {
          const waitTime = result.retryAfterSeconds || 60;
          setCountdown(waitTime);
          setErrorMessage(null);
          toast.info(`Please wait ${waitTime}s before requesting another code.`);
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
            {step === "email" ? (
              <Mail className="w-6 h-6" />
            ) : (
              <KeyRound className="w-6 h-6 text-amber-400" />
            )}
          </div>

          <DialogTitle className="text-xl font-bold text-white tracking-tight">
            {step === "email" ? "Verify Your Email to Vote" : "Enter Verification Code"}
          </DialogTitle>

          <DialogDescription className="text-white/50 text-sm">
            {step === "email" ? (
              <>
                To ensure a fair competition (<strong>one verified voter = one vote per category</strong>),
                please enter your email. We&apos;ll send a 6-digit code.
                {nomineeName && categoryName && (
                  <span className="block mt-2 text-amber-400 font-semibold text-xs">
                    Voting for: {nomineeName} in {categoryName}
                  </span>
                )}
              </>
            ) : (
              <>
                We sent a 6-digit code to <strong className="text-white">{email}</strong>.
                Enter the code below to cast your vote instantly.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Live Countdown Cooldown Notice */}
        {countdown > 0 && step === "email" && (
          <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center gap-2.5 text-xs text-amber-300">
            <Clock className="w-4 h-4 shrink-0 animate-pulse text-amber-400" />
            <div className="flex-1">
              <span>Security cooldown active. You can request another code in </span>
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
          <form onSubmit={handleSendCode} className="space-y-4 mt-2">
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
                  Sending code...
                </>
              ) : countdown > 0 ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-pulse" />
                  Please wait ({countdown}s)
                </>
              ) : (
                <>
                  Send 6-Digit Code
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        ) : (
          /* STEP 2: 6-DIGIT CODE INPUT & ONE-CLICK VERIFICATION */
          <form onSubmit={handleVerifyCode} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="voter-otp" className="text-xs uppercase tracking-wider text-white/60">
                6-Digit Verification Code
              </Label>
              <Input
                id="voter-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtpCode(val);
                }}
                autoFocus
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 rounded-xl text-center font-mono text-2xl font-bold tracking-[0.35em] focus-visible:ring-2 focus-visible:ring-amber-400"
              />
              <p className="text-[11px] text-white/40 text-center">
                Enter the 6-digit code sent to your inbox.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isVerifying || otpCode.trim().length < 6}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-bold h-11 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying & Voting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verify Code & Vote
                </>
              )}
            </Button>

            {/* Alternates: Magic Link Notice & Resend */}
            <div className="pt-2 border-t border-white/5 space-y-3">
              <p className="text-[11px] text-white/40 text-center leading-relaxed">
                Prefer clicking? You can also click the sign-in link sent to{" "}
                <span className="text-white font-mono">{email}</span>.
              </p>

              <div className="flex items-center justify-between text-xs text-white/50 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setErrorMessage(null);
                    setOtpCode("");
                  }}
                  className="hover:text-white underline underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
                >
                  Change email
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
                      Resend code
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/40 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>One-voter-one-vote verification</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
