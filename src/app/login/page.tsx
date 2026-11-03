"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  MailCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtpAction } from "@/app/actions/auth";
import { checkEmailTypo } from "@/lib/auth/email";
import { toast } from "sonner";

function LoginForm() {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || searchParams.get("redirectTo") || "/vote";
  const isAdminLogin = nextUrl.startsWith("/admin");

  const [step, setStep] = useState<"email" | "sent">("email");
  const [email, setEmail] = useState("");
  const [suggestedEmail, setSuggestedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Watch typing and proactively suggest typo fixes (e.g. gmial.com -> gmail.com)
  useEffect(() => {
    const fix = checkEmailTypo(email);
    setSuggestedEmail(fix);
  }, [email]);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await sendOtpAction(email, undefined, nextUrl);
      if (result.success) {
        setStep("sent");
        toast.success("Sign-in link sent!", {
          description: `Check your inbox at ${email}`,
        });
      } else {
        setErrorMessage(result.error || "Failed to send link. Please try again.");
        if (result.suggestedEmail) {
          setSuggestedEmail(result.suggestedEmail);
        }
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const result = await sendOtpAction(email, undefined, nextUrl);
      if (result.success) {
        toast.success("Link resent!", { description: `Check your inbox at ${email}` });
      } else {
        setErrorMessage(result.error || "Failed to resend.");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#0a0a0a]/95 border border-white/10 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            {step === "sent" ? (
              <MailCheck className="w-6 h-6 text-emerald-400" />
            ) : (
              <Mail className="w-6 h-6 text-amber-400" />
            )}
          </div>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          {step === "email"
            ? isAdminLogin
              ? "Admin Sign In"
              : "Voter Verification"
            : "Check Your Inbox"}
        </h1>
        <p className="text-white/50 text-xs sm:text-sm mt-2 leading-relaxed">
          {step === "email"
            ? isAdminLogin
              ? "Enter your admin email. We'll send you a secure one-click sign-in link."
              : "Enter your personal email. We'll send you a sign-in link. No passwords needed."
            : <>
                We sent a sign-in link to{" "}
                <span className="text-white font-medium">{email}</span>.
                Click the link in your email to{" "}
                {isAdminLogin ? "access the admin dashboard." : "verify your voting session."}
              </>}
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs leading-relaxed"
        >
          {errorMessage}
        </div>
      )}

      {step === "email" ? (
        <form onSubmit={handleSendLink} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider text-white/60">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={isAdminLogin ? "info@coastalnganyaawards.com" : "name@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-amber-400"
            />

            {/* Smart Typo Suggestion Chip */}
            {suggestedEmail && (
              <div className="p-2.5 rounded-lg bg-amber-400/10 border border-amber-400/25 flex items-center justify-between text-xs">
                <span className="text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
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
                : "Enter an active inbox you have access to. Links expire in 1 hour."}
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold h-12 rounded-xl text-sm transition-[background-color,color] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending link...
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
        <div className="space-y-5">
          {/* Inbox card */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center space-y-2">
            <MailCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-white text-sm font-semibold">Link sent to</p>
            <p className="text-white/80 text-sm font-mono truncate">{email}</p>
            <p className="text-white/40 text-xs mt-2 leading-relaxed">
              Open your email client and click{" "}
              <strong className="text-white/70">
                Sign in to Coastal Nganya Awards
              </strong>
              . If you don&apos;t see it, check your spam/junk folder.
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
              disabled={isLoading}
              className="flex items-center gap-1 hover:text-white underline underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              Resend link
            </button>
          </div>
        </div>
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

      <Suspense fallback={<div className="text-white/40">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
