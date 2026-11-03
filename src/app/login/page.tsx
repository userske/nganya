"use client";

import { useState, Suspense } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtpAction } from "@/app/actions/auth";
import { toast } from "sonner";

function LoginForm() {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || searchParams.get("redirectTo") || "/vote";
  const isAdminLogin = nextUrl.startsWith("/admin");

  const [step, setStep] = useState<"email" | "sent">("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Pass nextUrl so the magic link returns the user to the right page
      const result = await sendOtpAction(email, undefined, nextUrl);
      if (result.success) {
        setStep("sent");
        toast.success("Sign-in link sent!", {
          description: `Check your inbox at ${email}`,
        });
      } else {
        setErrorMessage(result.error || "Failed to send link. Please try again.");
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
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
            {step === "sent" ? (
              <MailCheck className="w-5 h-5 text-green-400" />
            ) : (
              <Mail className="w-5 h-5" />
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
              ? "Enter your admin email. We'll send you a secure sign-in link."
              : "Enter your email. We'll send you a sign-in link. No passwords needed."
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
          className="mb-6 p-3 rounded-xl bg-white/5 border border-white/20 text-white text-xs leading-relaxed"
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
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 focus-visible:ring-2 focus-visible:ring-white"
            />
            <p className="text-[11px] text-white/40">
              {isAdminLogin
                ? "Use your registered admin address (info@coastalnganyaawards.com)."
                : "One verified email = one vote per category across all categories."}
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-white hover:bg-white/90 text-black font-semibold h-12 rounded-xl text-sm transition-[background-color,color] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-white"
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
          <div className="rounded-xl bg-white/5 border border-white/10 p-5 text-center space-y-2">
            <MailCheck className="w-8 h-8 text-green-400 mx-auto" />
            <p className="text-white text-sm font-semibold">Link sent to</p>
            <p className="text-white/70 text-sm font-mono truncate">{email}</p>
            <p className="text-white/40 text-xs mt-1">
              Open your email and click{" "}
              <strong className="text-white/60">
                {isAdminLogin ? "Sign in to Coastal Nganya Awards" : "Sign in to Coastal Nganya Awards"}
              </strong>
              . The link expires in 1 hour.
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

          <p className="text-[11px] text-white/30 text-center">
            Didn&apos;t receive it? Check your spam folder.
          </p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/40 font-mono">
        <ShieldCheck className="w-4 h-4 text-white/60" />
        <span>Secure passwordless sign-in</span>
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
