"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Loader2, ShieldCheck, ArrowRight, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtpAction, verifyOtpAction } from "@/app/actions/auth";
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
        setErrorMessage(result.error || "Failed to send verification code.");
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
        toast.success("Email verified!", {
          description: "Your session is active. You can now vote in all categories.",
        });
        onVerified();
        onOpenChange(false);
      } else {
        setErrorMessage(result.error || "Invalid code. Please try again.");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0a0f1d] border border-amber-500/20 text-white p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="text-left">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
            {step === "email" ? <Mail className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {step === "email" ? "Verify Your Email to Vote" : "Enter Verification Code"}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            {step === "email" ? (
              <>
                To ensure a fair competition (<strong>one verified voter = one vote per category</strong>), please verify your email. No passwords needed.
                {nomineeName && categoryName && (
                  <span className="block mt-2 text-amber-400/90 font-medium text-xs">
                    Voting for: {nomineeName} in {categoryName}
                  </span>
                )}
              </>
            ) : (
              <>
                We sent a 6-digit code to <span className="text-amber-400 font-semibold">{email}</span>. Enter it below to cast your vote.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
            {errorMessage}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="voter-email" className="text-xs uppercase tracking-wider text-slate-300">
                Your Email Address
              </Label>
              <Input
                id="voter-email"
                type="email"
                placeholder="e.g. juma@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-amber-500/50"
              />
              <p className="text-[11px] text-slate-500">
                You will only verify once for the entire awards season.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold h-11 rounded-xl transition-[background-color,color] duration-150 ease-out"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending 6-digit code...
                </>
              ) : (
                <>
                  Send Verification Code
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="otp-code" className="text-xs uppercase tracking-wider text-slate-300">
                6-Digit Code
              </Label>
              <Input
                id="otp-code"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                required
                className="bg-white/5 border-white/10 text-white text-center font-mono text-2xl tracking-[0.3em] h-12 placeholder:text-slate-600 focus-visible:ring-amber-500/50"
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
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold h-11 rounded-xl transition-[background-color,color] duration-150 ease-out"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verify & Continue
                </>
              )}
            </Button>
          </form>
        )}

        <div className="mt-2 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>No spam • One vote per category • Anonymous tallies</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
