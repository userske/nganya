"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, KeyRound, Loader2, CheckCircle2, ArrowRight, ShieldCheck, ChevronLeft } from "lucide-react";
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
        toast.success("Verification code sent", {
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
        toast.success("Verified successfully", {
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
    <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#0a0a0a]/95 border border-white/10 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
            {step === "email" ? <Mail className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          {step === "email" ? "Voter Verification" : "Enter 6-Digit Code"}
        </h1>
        <p className="text-white/50 text-xs sm:text-sm mt-2 leading-relaxed">
          {step === "email"
            ? "Enter your email to verify your voting session. No passwords needed."
            : `We sent a 6-digit code to ${email}`}
        </p>
      </div>

      {errorMessage && (
        <div role="alert" className="mb-6 p-3 rounded-xl bg-white/5 border border-white/20 text-white text-xs leading-relaxed">
          {errorMessage}
        </div>
      )}

      {step === "email" ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider text-white/60">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 focus-visible:ring-2 focus-visible:ring-white"
            />
            <p className="text-[11px] text-white/40">
              One verified email = one vote per category across all 61 categories.
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
                Sending code...
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
            <Label htmlFor="code" className="text-xs uppercase tracking-wider text-white/60">
              Verification Code
            </Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              required
              className="bg-white/5 border-white/10 text-white text-center font-mono text-3xl tracking-[0.3em] h-14 placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-white"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-white/50">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="hover:text-white underline underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
            >
              Change email
            </button>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isLoading}
              className="hover:text-white underline underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded disabled:opacity-50"
            >
              Resend code
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading || otpCode.length < 6}
            className="w-full bg-white hover:bg-white/90 text-black font-semibold h-12 rounded-xl text-sm transition-[background-color,color] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-white"
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

      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/40 font-mono">
        <ShieldCheck className="w-4 h-4 text-white/60" />
        <span>One voter per category • Anonymous tallies</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute top-8 left-8">
        <Button asChild variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white">
          <Link href="/vote">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Categories
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div className="text-white/40">Loading verification...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
