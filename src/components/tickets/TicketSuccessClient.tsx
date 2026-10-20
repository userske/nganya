"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { CheckCircle2, Loader2, Printer, ArrowRight, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TicketItem {
  id: string;
  ticket_code: string;
  status: string;
  qr_payload: string;
}

interface TicketSuccessClientProps {
  orderRef: string;
  isSimulated?: boolean;
}

export function TicketSuccessClient({ orderRef }: TicketSuccessClientProps) {
  const [status, setStatus] = useState<"pending" | "confirmed" | "failed">("pending");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [, setPollCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function checkStatus() {
      try {
        const res = await fetch(`/api/orders/status?ref=${encodeURIComponent(orderRef)}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "confirmed") {
          if (!isMounted) return;
          setStatus("confirmed");
          setOrderDetails(data);

          // Render QR codes
          if (data.tickets && Array.isArray(data.tickets)) {
            const qrMap: Record<string, string> = {};
            for (const t of data.tickets) {
              const url = await QRCode.toDataURL(t.qr_payload || t.ticket_code, {
                width: 260,
                margin: 2,
                color: {
                  dark: "#000000",
                  light: "#ffffff",
                },
              });
              qrMap[t.id] = url;
            }
            if (isMounted) setQrImages(qrMap);
          }
        } else if (data.status === "failed") {
          if (isMounted) setStatus("failed");
        }
      } catch {
        // Retry silently
      }
    }

    checkStatus();

    // Poll every 2.5s for up to 30 attempts (~75s)
    const interval = setInterval(() => {
      setPollCount((prev) => {
        if (prev > 30 || status === "confirmed") {
          clearInterval(interval);
          return prev;
        }
        checkStatus();
        return prev + 1;
      });
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderRef, status]);

  const handlePrint = () => {
    window.print();
  };

  if (status === "pending") {
    return (
      <div className="max-w-xl mx-auto p-8 sm:p-12 rounded-3xl bg-[#0a0a0a]/95 border border-white/10 text-center backdrop-blur-xl">
        <Loader2 className="w-10 h-10 text-white animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">
          Verifying Payment...
        </h2>
        <p className="text-white/50 text-sm mb-6 leading-relaxed">
          Order Reference: <strong className="text-white font-mono">{orderRef}</strong>.
          <br />
          Please wait while we confirm your transaction and issue your tickets.
        </p>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/40 font-mono">
          Automatic refresh in progress • Please do not close this window
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="max-w-xl mx-auto p-8 sm:p-12 rounded-3xl bg-[#0a0a0a]/95 border border-white/15 text-center backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">
          Payment Unsuccessful
        </h2>
        <p className="text-white/50 text-sm mb-6">
          Your payment could not be completed or was cancelled. Any reserved tickets have been released.
        </p>
        <Button asChild className="bg-white hover:bg-white/90 text-black font-semibold focus-visible:ring-2 focus-visible:ring-white">
          <Link href="/tickets">Try Again</Link>
        </Button>
      </div>
    );
  }

  const tickets: TicketItem[] = orderDetails?.tickets || [];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-white/[0.04] border border-white/20 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white uppercase tracking-tight mb-2">
          Payment Confirmed
        </h1>
        <p className="text-white/70 text-sm max-w-md mx-auto">
          Thank you, <strong>{orderDetails?.buyerName}</strong>. Your {tickets.length} pass(es) are confirmed and ready for entry.
        </p>
        <p className="text-xs text-white/50 mt-2 font-mono">
          Order #{orderDetails?.orderNumber} • Sent to {orderDetails?.buyerEmail}
        </p>
      </div>

      {/* Ticket Cards */}
      <div className="space-y-6">
        {tickets.map((t, idx) => (
          <div
            key={t.id}
            className="p-6 sm:p-8 rounded-3xl bg-[#0a0a0a] border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden"
          >
            <div className="space-y-3 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold uppercase tracking-wider">
                <Ticket className="w-3.5 h-3.5" />
                {orderDetails?.tierName || "General Pass"} • Pass #{idx + 1}
              </span>
              <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
                Coastal Nganya Awards Night
              </h3>
              <div className="text-xs text-white/50 space-y-1 font-mono">
                <div>Holder: <span className="text-white font-bold">{orderDetails?.buyerName}</span></div>
                <div>Code: <span className="text-white font-bold tracking-widest">{t.ticket_code}</span></div>
                <div>Venue: Mombasa Cement Grounds, Mombasa</div>
                <div>Date: Saturday, Dec 6, 2025 • 6:00 PM EAT</div>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0 text-center">
              {qrImages[t.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrImages[t.id]}
                  alt={`Ticket QR Code for ${t.ticket_code}`}
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center text-black text-xs font-mono">
                  Generating QR...
                </div>
              )}
              <div className="text-[10px] text-black font-mono font-bold mt-1 tracking-wider uppercase">
                Scan at Gate
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button
          onClick={handlePrint}
          variant="outline"
          className="w-full sm:w-auto bg-transparent hover:bg-white/5 text-white border-white/20 font-semibold focus-visible:ring-2 focus-visible:ring-white"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print / Save PDF
        </Button>

        <Button
          asChild
          className="w-full sm:w-auto bg-white hover:bg-white/90 text-black font-semibold focus-visible:ring-2 focus-visible:ring-white"
        >
          <Link href="/vote">
            Cast Your Votes
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
