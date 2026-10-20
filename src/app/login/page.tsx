"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trophy, Mail, KeyRound, Loader2, CheckCircle2, ArrowRight, ShieldCheck, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtpAction, verifyOtpAction } from "@/app/actions/auth";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/vote";

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await sendOtpAction(email);
      if (result.success) {
        setStep("otp");
        toast.success("Verification code sent!", {
          description: `Check your inbox at ${email}`,
        });
      } else {
        setErrorMessage(result.error || "Failed to send code.");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await verifyOtpAction(email, otpCode);
      if (result.success) {
        toast.success("Verified successfully!", {
          description: "Your voter session is active.",
        });
        router.push(nextUrl);
        router.refresh();
      } else {
        setErrorMessage(result.error || "Invalid code.");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#0c1220]/90 border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.12)] backdrop-blur-xl">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          {step === "email" ? "Voter Verification" : "Enter 6-Digit Code"}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
          {step === "email"
            ? "Enter your email to verify your voting session. No passwords needed."
            : `We sent a 6-digit code to ${email}`}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
          {errorMessage}
        </div>
      )}

      {step === "email" ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider text-slate-300">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. juma@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 focus-visible:ring-amber-500/50"
            />
            <p className="text-[11px] text-slate-500">
              One verified email = one vote per category across all 61 categories.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold h-12 rounded-xl text-sm transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending verification code...
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
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-xs uppercase tracking-wider text-slate-300">
              Verification Code
            </Label>
            <Input
              id="code"
              type="text"
              maxLength={6}
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              required
              className="bg-white/5 border-white/10 text-white text-center font-mono text-3xl tracking-[0.3em] h-14 placeholder:text-slate-600 focus-visible:ring-amber-500/50"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="hover:text-amber-400 underline"
            >
              Change email
            </button>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isLoading}
              className="hover:text-amber-400 underline"
            >
              Resend code
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading || otpCode.length < 6}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold h-12 rounded-xl text-sm transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Verify & Continue Voting
              </>
            )}
          </Button>
        </form>
      )}

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Secure Passwordless OTP • Anticheat Monitored</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="absolute top-8 left-8">
        <Button asChild variant="ghost" size="sm" className="text-slate-400 hover:text-white">
          <Link href="/vote">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Categories
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div className="text-slate-400">Loading verification...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
