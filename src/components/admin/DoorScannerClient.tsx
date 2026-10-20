"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Keyboard,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { processDoorCheckinAction, type CheckinResult } from "@/app/actions/checkin";

export function DoorScannerClient() {
  const [manualCode, setManualCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<CheckinResult | null>(null);
  const [scanHistory, setScanHistory] = useState<CheckinResult[]>([]);
  const [cameraActive, setCameraActive] = useState(true);

  const handleScan = async (detectedCodes: any[]) => {
    if (isProcessing || !detectedCodes || detectedCodes.length === 0) return;
    const rawVal = detectedCodes[0]?.rawValue;
    if (!rawVal) return;

    await executeCheckin(rawVal);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode || isProcessing) return;
    await executeCheckin(manualCode);
    setManualCode("");
  };

  const executeCheckin = async (code: string) => {
    setIsProcessing(true);
    try {
      const result = await processDoorCheckinAction(code);
      setScanResult(result);
      setScanHistory((prev) => [result, ...prev.slice(0, 19)]);
    } catch {
      setScanResult({
        success: false,
        status: "NOT_FOUND",
        message: "Network error during check-in validation.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Gate Control & Door Scanner
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
          QR Ticket Scanner
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Scan QR codes directly with your device camera or enter code manually. Each ticket can only be checked in once.
        </p>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Camera / Visual Viewfinder */}
        <div className="md:col-span-7 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-white/10 shadow-2xl min-h-[340px] flex items-center justify-center">
            {cameraActive ? (
              <Scanner
                onScan={handleScan}
                onError={(error) => console.log("Scanner error:", error)}
                styles={{
                  container: { width: "100%", height: "100%" },
                }}
              />
            ) : (
              <div className="p-8 text-center text-slate-400">
                <Camera className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="text-sm">Camera paused</p>
                <Button
                  onClick={() => setCameraActive(true)}
                  className="mt-4 bg-amber-500 text-black font-bold text-xs"
                >
                  Activate Camera
                </Button>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-2 text-white font-mono text-sm z-20">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                Validating Ticket Signature...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Camera active & listening</span>
            <button
              onClick={() => setCameraActive(!cameraActive)}
              className="text-amber-400 hover:underline"
            >
              {cameraActive ? "Pause Camera" : "Resume Camera"}
            </button>
          </div>

          {/* Manual Input Form */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase font-bold text-slate-300">
                <Keyboard className="w-3.5 h-3.5 text-amber-400" />
                Manual Code Entry
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. CNA-TKT-884920"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  className="bg-white/5 border-white/10 text-white font-mono uppercase h-11"
                />
                <Button
                  type="submit"
                  disabled={isProcessing || !manualCode}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold h-11 shrink-0"
                >
                  Check In
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Scan Result Feedback Banner & History */}
        <div className="md:col-span-5 space-y-6">
          {/* Result Alert */}
          {scanResult ? (
            <div
              className={`p-6 rounded-3xl border-2 text-center transition-all ${
                scanResult.success
                  ? "bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                  : "bg-red-950/70 border-red-500 text-red-300 shadow-[0_0_40px_rgba(239,68,68,0.3)]"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  scanResult.success
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {scanResult.success ? (
                  <CheckCircle2 className="w-10 h-10" />
                ) : (
                  <XCircle className="w-10 h-10" />
                )}
              </div>

              <div className="text-xl font-black uppercase tracking-tight mb-1">
                {scanResult.success ? "ACCESS GRANTED" : "ENTRY REJECTED"}
              </div>

              <p className="text-xs font-semibold mb-4 leading-relaxed opacity-90">
                {scanResult.message}
              </p>

              {scanResult.buyerName && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-left text-xs font-mono space-y-1">
                  <div>Name: <span className="font-bold text-white">{scanResult.buyerName}</span></div>
                  <div>Tier: <span className="text-amber-400 font-bold">{scanResult.tierName || "General Pass"}</span></div>
                  <div>Code: <span className="text-slate-300">{scanResult.ticketCode}</span></div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] text-center text-slate-500">
              <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="text-xs uppercase tracking-wider font-bold">
                Awaiting Next Scan
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Scan result will appear here with color confirmation.
              </p>
            </div>
          )}

          {/* Recent Scans History */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Recent Gate Activity ({scanHistory.length})
            </h3>
            {scanHistory.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No scans recorded in this session yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {scanHistory.map((h, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="truncate mr-2">
                      <span className={h.success ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                        {h.success ? "✓ IN" : "✗ REJECT"}
                      </span>
                      <span className="text-slate-300 ml-2">{h.buyerName || h.ticketCode}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {h.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
