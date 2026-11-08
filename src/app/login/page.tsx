"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  KeyRound,
  RefreshCw,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtpAction, verifyOtpAction } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { checkEmailTypo } from "@/lib/auth/email";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || searchParams.get("redirectTo") || "/vote";
  const isAdminLogin = nextUrl.startsWith("/admin");

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [suggestedEmail, setSuggestedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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

  // Watch typing and proactively suggest typo fixes (e.g. gmial.com -> gmail.com)
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
      const result = await sendOtpAction(email, undefined, nextUrl);
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

      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: cleanToken,
        type: "email",
      });

      if (error || !data.user) {
        setErrorMessage(
          error?.message?.includes("expired")
            ? "Verification code has expired. Please request a new code."
            : "Invalid verification code. Please check your email or click resend."
        );
        setIsVerifying(false);
        return;
      }

      try {
        await verifyOtpAction(email, cleanToken);
      } catch {
        // Non-blocking
      }

      toast.success("Signed in successfully!");
      router.push(nextUrl);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to verify code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const result = await sendOtpAction(email, undefined, nextUrl);
      if (result.success) {
        setCountdown(60);
        toast.success("Code resent!", { description: `Check your inbox at ${email}` });
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
    <div className="w-full max-w-md p-8 rounded-3xl bg-[#0c0c0c] border border-white/10 shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          {step === "email" ? (
            <Mail className="w-7 h-7" />
          ) : (
            <KeyRound className="w-7 h-7 text-amber-400" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight uppercase">
          {isAdminLogin
            ? "Admin Portal Sign-In"
            : step === "email"
            ? "Voter Sign-In"
            : "Enter 6-Digit Code"}
        </h1>

        <p className="text-white/50 text-xs sm:text-sm mt-2 leading-relaxed">
          {step === "email" ? (
            isAdminLogin
              ? "Sign in with your authorized admin email to manage event operations."
              : "Verify your email to cast official votes. Passwordless and instant."
          ) : (
            <>
              We sent a 6-digit code to <strong className="text-white font-mono">{email}</strong>.
            </>
          )}
        </p>
      </div>

      {/* Security Cooldown Notice */}
      {countdown > 0 && step === "email" && (
        <div className="mb-4 p-3 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center gap-2.5 text-xs text-amber-300">
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
          className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs leading-relaxed"
        >
          {errorMessage}
        </div>
      )}

      {step === "email" ? (
        <form onSubmit={handleSendLink} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email-input"
              className="text-xs uppercase tracking-wider text-white/60"
            >
              Email Address
            </Label>
            <Input
              id="email-input"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              {isAdminLogin
                ? "Use your registered admin address (e.g. info@coastalnganyaawards.com)."
                : "Enter an active inbox you have access to. Codes expire in 1 hour."}
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email || countdown > 0}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-bold h-12 rounded-xl text-sm transition-[background-color,color] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-amber-400"
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
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="otp-input"
              className="text-xs uppercase tracking-wider text-white/60"
            >
              6-Digit Verification Code
            </Label>
            <Input
              id="otp-input"
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
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-14 rounded-xl text-center font-mono text-3xl font-bold tracking-[0.35em] focus-visible:ring-2 focus-visible:ring-amber-400"
            />
            <p className="text-[11px] text-white/40 text-center">
              Check your inbox for the 6-digit confirmation code.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isVerifying || otpCode.trim().length < 6}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-bold h-12 rounded-xl text-sm transition-all focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Verify & Sign In
              </>
            )}
          </Button>

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
                    Resend code
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/40 font-mono">
        <ShieldCheck className="w-4 h-4 text-amber-400" />
        <span>Passwordless · One-click verification</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute top-8 left-8">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-white/50 hover:text-white hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white"
        >
          <Link href="/vote">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Categories
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 rounded-3xl bg-[#0c0c0c] border border-white/10 text-center text-white/40">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
            Loading portal...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
