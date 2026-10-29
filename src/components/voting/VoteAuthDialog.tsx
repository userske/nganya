"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Mail, Loader2, ShieldCheck, ArrowRight, MailCheck, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtpAction } from "@/app/actions/auth";
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
  nomineeName,
  categoryName,
}: VoteAuthDialogProps) {
  const pathname = usePathname();
  const [step, setStep] = useState<"email" | "sent">("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Pass current pathname so the magic link returns user to this vote page
      const result = await sendOtpAction(email, undefined, pathname);
      if (result.success) {
        setStep("sent");
        toast.success("Magic link sent!", {
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
      const result = await sendOtpAction(email, undefined, pathname);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0a0a0a] border border-white/10 text-white p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="text-left">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-3">
            {step === "email" ? <Mail className="w-5 h-5" /> : <MailCheck className="w-5 h-5 text-green-400" />}
          </div>
          <DialogTitle className="text-xl font-bold text-white tracking-tight">
            {step === "email" ? "Verify Your Email to Vote" : "Check Your Inbox"}
          </DialogTitle>
          <DialogDescription className="text-white/50 text-sm">
            {step === "email" ? (
              <>
                To ensure a fair competition (<strong>one verified voter = one vote per category</strong>), please verify your email. No passwords needed.
                {nomineeName && categoryName && (
                  <span className="block mt-2 text-white/80 font-medium text-xs">
                    Voting for: {nomineeName} in {categoryName}
                  </span>
                )}
              </>
            ) : (
              <>
                We sent a sign-in link to{" "}
                <span className="text-white font-medium">{email}</span>.{" "}
                Click the link in your email to verify and cast your vote.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div role="alert" className="p-3 rounded-lg bg-white/5 border border-white/20 text-white text-xs leading-relaxed">
            {errorMessage}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleSendLink} className="space-y-4 mt-2">
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
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-white"
              />
              <p className="text-[11px] text-white/40">
                You will only verify once for the entire awards season.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-white hover:bg-white/90 text-black font-semibold h-11 rounded-xl transition-[background-color,color] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-white"
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
          <div className="space-y-4 mt-2">
            {/* Inbox illustration */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center space-y-1">
              <p className="text-white text-sm font-medium">Link sent to</p>
              <p className="text-white/70 text-sm font-mono truncate">{email}</p>
              <p className="text-white/40 text-xs mt-2">
                Open your email app and click <strong className="text-white/60">Sign in to Coastal Nganya Awards</strong>. The link expires in 1 hour.
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
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Resend link
              </button>
            </div>

            <p className="text-[11px] text-white/30 text-center">
              Didn&apos;t receive it? Check your spam folder.
            </p>
          </div>
        )}

        <div className="mt-2 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-white/40 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-white/60" />
          <span>One verified voter per category • Anonymous tallies</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
