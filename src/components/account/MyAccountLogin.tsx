"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowRight, ShieldCheck, MailCheck, RefreshCw, ChevronLeft, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtpAction } from "@/app/actions/auth";
import { toast } from "sonner";

export function MyAccountLogin() {
  const [step, setStep] = useState<"email" | "sent">("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await sendOtpAction(email, undefined, "/my-account");
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
    setIsLoading(true);
    try {
      const result = await sendOtpAction(email, undefined, "/my-account");
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
    <div className="max-w-md w-full mx-auto p-8 sm:p-10 rounded-3xl bg-[#0a0a0a]/95 border border-white/10 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          {step === "sent" ? (
            <MailCheck className="w-6 h-6 text-emerald-400" />
          ) : (
            <UserCheck className="w-6 h-6" />
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          {step === "email" ? "Voter & Attendee Account" : "Check Your Inbox"}
        </h1>
        <p className="text-white/50 text-xs sm:text-sm mt-2 leading-relaxed">
          {step === "email"
            ? "Sign in with your email to view all your cast votes, official gate passes, and QR tickets in one place."
            : <>
                We sent a secure sign-in link to{" "}
                <span className="text-white font-medium">{email}</span>.
                Click it to access your account instantly.
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
            <Label htmlFor="account-email" className="text-xs uppercase tracking-wider text-white/60">
              Your Email Address
            </Label>
            <Input
              id="account-email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 focus-visible:ring-2 focus-visible:ring-white"
            />
            <p className="text-[11px] text-white/40">
              Use the email address you used to vote or purchase event tickets.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold h-12 rounded-xl text-sm transition-[background-color,transform] duration-150 ease-out active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending link...
              </>
            ) : (
              <>
                Access My Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl bg-white/5 border border-white/10 p-5 text-center space-y-2">
            <MailCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-white text-sm font-semibold">Link sent to</p>
            <p className="text-white/70 text-sm font-mono truncate">{email}</p>
            <p className="text-white/40 text-xs mt-1">
              Open your email app and click <strong className="text-white/60">Sign in to Coastal Nganya Awards</strong>.
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
        <ShieldCheck className="w-4 h-4 text-white/60" />
        <span>Passwordless · Secure sign-in</span>
      </div>
    </div>
  );
}
