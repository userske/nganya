"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Camera, CheckCircle2, XCircle, Loader2, ShieldCheck, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { processDoorCheckinAction } from "@/app/actions/checkin";

interface ScanResult {
  success: boolean;
  status: string;
  message: string;
  ticketCode?: string;
  buyerName?: string;
  tierName?: string;
}

export function DoorScannerClient() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [manualCode, setManualCode] = useState("");
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  const handleScan = async (detectedCodes: any[]) => {
    if (!detectedCodes || detectedCodes.length === 0 || isProcessing) return;

    const rawValue = detectedCodes[0]?.rawValue;
    if (!rawValue) return;

    await processTicketCode(rawValue);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode || isProcessing) return;
    await processTicketCode(manualCode);
    setManualCode("");
  };

  const processTicketCode = async (code: string) => {
    setIsProcessing(true);
    try {
      const res = await processDoorCheckinAction(code);
      const result: ScanResult = {
        success: res.success,
        status: res.status,
        message: res.message,
        ticketCode: res.ticketCode || code,
        buyerName: res.buyerName,
        tierName: res.tierName,
      };

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">
          Gate Control & Door Scanner
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
          QR Ticket Scanner
        </h1>
        <p className="text-white/50 text-xs sm:text-sm mt-1">
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
              <div className="p-8 text-center text-white/40">
                <Camera className="w-12 h-12 mx-auto mb-3 text-white/30" />
                <p className="text-sm">Camera paused</p>
                <Button
                  onClick={() => setCameraActive(true)}
                  className="mt-4 bg-white text-black font-semibold text-xs focus-visible:ring-2 focus-visible:ring-white"
                >
                  Activate Camera
                </Button>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-2 text-white font-mono text-sm z-20">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
                Validating Ticket...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Camera active & listening</span>
            <button
              onClick={() => setCameraActive(!cameraActive)}
              className="text-white underline underline-offset-4 hover:text-white/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
            >
              {cameraActive ? "Pause Camera" : "Resume Camera"}
            </button>
          </div>

          {/* Manual Input Form */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase font-bold text-white/70">
                <Keyboard className="w-3.5 h-3.5 text-white/70" />
                Manual Code Entry
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. CNA-TKT-884920"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  className="bg-white/5 border-white/10 text-white font-mono uppercase h-11 focus-visible:ring-2 focus-visible:ring-white"
                />
                <Button
                  type="submit"
                  disabled={isProcessing || !manualCode}
                  className="bg-white hover:bg-white/90 text-black font-semibold h-11 shrink-0 focus-visible:ring-2 focus-visible:ring-white"
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
              className={`p-6 rounded-3xl border-2 text-center transition-[background-color,border-color,box-shadow] duration-200 ease-out ${
                scanResult.success
                  ? "bg-white/[0.06] border-white shadow-2xl"
                  : "bg-white/[0.03] border-white/30 shadow-2xl"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-white/10 text-white">
                {scanResult.success ? (
                  <CheckCircle2 className="w-10 h-10" />
                ) : (
                  <XCircle className="w-10 h-10" />
                )}
              </div>

              <div className="text-xl font-black uppercase tracking-tight mb-1 text-white">
                {scanResult.success ? "ACCESS GRANTED" : "ENTRY REJECTED"}
              </div>

              <p className="text-xs font-semibold mb-4 leading-relaxed text-white/70">
                {scanResult.message}
              </p>

              {scanResult.buyerName && (
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-left text-xs font-mono space-y-1">
                  <div>Name: <span className="font-bold text-white">{scanResult.buyerName}</span></div>
                  <div>Tier: <span className="text-white font-bold">{scanResult.tierName || "General Pass"}</span></div>
                  <div>Code: <span className="text-white/60">{scanResult.ticketCode}</span></div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] text-center text-white/40">
              <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-white/30" />
              <p className="text-xs uppercase tracking-wider font-bold text-white/60">
                Awaiting Next Scan
              </p>
              <p className="text-[11px] text-white/40 mt-1">
                Scan result will appear here with confirmation.
              </p>
            </div>
          )}

          {/* Recent Scans History */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-3">
              Recent Gate Activity ({scanHistory.length})
            </h3>
            {scanHistory.length === 0 ? (
              <p className="text-xs text-white/40 italic">No scans recorded in this session yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {scanHistory.map((h, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="min-w-0 truncate mr-2">
                      <span className="font-bold text-white">
                        {h.success ? "[PASS]" : "[REJECT]"}
                      </span>
                      <span className="text-white/70 ml-2">{h.buyerName || h.ticketCode}</span>
                    </div>
                    <span className="text-[10px] text-white/40 shrink-0">
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
