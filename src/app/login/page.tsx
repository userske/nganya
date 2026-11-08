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
  MailCheck,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtpAction } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { checkEmailTypo } from "@/lib/auth/email";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || searchParams.get("redirectTo") || "/vote";
  const isAdminLogin = nextUrl.startsWith("/admin");

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

  // Watch typing and suggest typo fixes
  useEffect(() => {
    const fix = checkEmailTypo(email);
    setSuggestedEmail(fix);
  }, [email]);

  // Active listener when magic link is sent:
  // Detects when the user taps the link in their email (in another tab or window)
  useEffect(() => {
    if (step !== "sent") return;

    const supabase = createClient();
    let isMounted = true;

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && isMounted) {
        toast.success("Signed in successfully!");
        router.push(nextUrl);
        router.refresh();
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && isMounted) {
        toast.success("Signed in successfully!");
        router.push(nextUrl);
        router.refresh();
      }
    });

    const pollInterval = setInterval(checkUser, 2500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      subscription.unsubscribe();
    };
  }, [step, nextUrl, router]);

  const handleSendLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (countdown > 0) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await sendOtpAction(email, undefined, nextUrl);
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
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0c0c0c] border border-white/10 shadow-2xl relative">
      <Link
        href="/"
        className="inline-flex items-center text-xs text-white/50 hover:text-white mb-6 transition-colors font-mono"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Awards
      </Link>

      <div className="text-left space-y-2 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          {step === "email" ? (
            <Mail className="w-6 h-6" />
          ) : (
            <MailCheck className="w-6 h-6 text-emerald-400" />
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
          {isAdminLogin
            ? step === "email"
              ? "Admin Command Center"
              : "Check Admin Email"
            : step === "email"
            ? "Sign in with Magic Link"
            : "Check Your Inbox"}
        </h1>

        <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
          {isAdminLogin
            ? step === "email"
              ? "Enter your authorized administrative email address. A 1-click magic link will be sent to your inbox."
              : `We sent a magic sign-in link to ${email}. Tap the link to access the Executive Control Panel.`
            : step === "email"
            ? "Enter your email to receive a passwordless sign-in link. One voter = one vote per award category."
            : `We sent a 1-click sign-in link to ${email}. Open the email on your device and tap the link.`}
        </p>
      </div>

      {countdown > 0 && step === "email" && (
        <div className="mb-4 p-3 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center gap-2.5 text-xs text-amber-300">
          <Clock className="w-4 h-4 shrink-0 animate-pulse text-amber-400" />
          <div className="flex-1">
            <span>Security cooldown active. You can request another link in </span>
            <strong className="text-white font-mono font-bold">{countdown}s</strong>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs leading-relaxed"
        >
          {errorMessage}
        </div>
      )}

      {step === "email" ? (
        <form onSubmit={handleSendLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-xs uppercase tracking-wider text-white/60 font-semibold">
              Email Address
            </Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder={isAdminLogin ? "info@coastalnganyaawards.com" : "name@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-amber-400 text-sm"
            />

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
              No password needed. We will send a secure 1-click login link.
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
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-white">
                Waiting for link click...
              </span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Open your inbox, tap the magic sign-in link, and this page will sign you in automatically.
            </p>
          </div>

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
              onClick={() => handleSendLink()}
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

      <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/40 font-mono">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
        <span>Secure passwordless authentication</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <header className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-black font-black text-base shadow-lg shadow-amber-400/20">
            CNA
          </div>
          <span className="font-bold text-white text-sm sm:text-base tracking-wide">
            COASTAL NGANYA AWARDS
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense
          fallback={
            <div className="p-8 text-center text-white/50 text-xs font-mono">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
              Loading authentication...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      <footer className="p-6 text-center text-xs text-white/30 font-mono">
        &copy; 2026 Coastal Nganya Awards &middot; Mombasa, Kenya
      </footer>
    </div>
  );
}
