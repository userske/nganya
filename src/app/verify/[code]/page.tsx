import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySignedQrPayload } from "@/lib/security/ticket-crypto";
import { CheckCircle2, XCircle, ShieldAlert, Ticket } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface VerifyPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: VerifyPageProps) {
  const { code } = await params;
  return {
    title: `Verify Ticket ${code} — Coastal Nganya Awards`,
    robots: "noindex",
  };
}

interface TicketRecord {
  ticket_code: string;
  status: string;
  buyer_name: string;
  tier_name: string;
  order_number: string;
  created_at: string;
  qr_payload: string;
}

export default async function VerifyTicketPage({ params }: VerifyPageProps) {
  const { code } = await params;
  const ticketCode = decodeURIComponent(code || "");

  let verifyStatus: "valid" | "used" | "invalid" | "tampered" | "not_found" = "not_found";
  let ticketRecord: TicketRecord | null = null;
  let qrValid = false;

  if (ticketCode) {
    const supabase = await createAdminClient();

    const { data: ticket } = await supabase
      .from("tickets")
      .select(
        `
        ticket_code,
        status,
        buyer_name,
        qr_payload,
        created_at,
        ticket_tiers ( name ),
        orders ( order_number )
      `
      )
      .eq("ticket_code", ticketCode)
      .maybeSingle();

    if (ticket) {
      ticketRecord = {
        ticket_code: ticket.ticket_code,
        status: ticket.status,
        buyer_name: ticket.buyer_name,
        tier_name: (ticket as any).ticket_tiers?.name ?? "General Admission",
        order_number: (ticket as any).orders?.order_number ?? "—",
        created_at: ticket.created_at,
        qr_payload: ticket.qr_payload,
      };

      // Verify the QR payload HMAC signature
      const parsed = verifySignedQrPayload(ticket.qr_payload);
      qrValid = parsed !== null && parsed.code === ticketCode;

      if (!qrValid) {
        verifyStatus = "tampered";
      } else if (ticket.status === "valid") {
        verifyStatus = "valid";
      } else if (ticket.status === "used" || ticket.status === "scanned") {
        verifyStatus = "used";
      } else {
        verifyStatus = "invalid";
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-28 flex items-start justify-center">
        {verifyStatus === "not_found" && <NotFoundCard code={ticketCode} />}
        {verifyStatus === "valid" && ticketRecord && <ValidCard ticket={ticketRecord} />}
        {verifyStatus === "tampered" && ticketRecord && <TamperedCard ticket={ticketRecord} />}
        {verifyStatus === "used" && ticketRecord && <UsedCard ticket={ticketRecord} />}
        {verifyStatus === "invalid" && ticketRecord && <InvalidCard ticket={ticketRecord} />}
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sub-components
─────────────────────────────────────────────── */

function ValidCard({ ticket }: { ticket: TicketRecord }) {
  const issuedDate = new Date(ticket.created_at).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full rounded-3xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl">
      <div className="bg-emerald-950/60 border-b border-emerald-800/40 px-8 py-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">
            Ticket Valid
          </h1>
          <p className="text-emerald-400 text-sm font-medium mt-0.5">
            Authentic and unused — allow gate entry.
          </p>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Ticket className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest font-mono mb-1">
              Ticket Tier
            </p>
            <p className="text-lg font-bold text-white uppercase tracking-tight">
              {ticket.tier_name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="Ticket Code" value={ticket.ticket_code} mono />
          <InfoRow label="Order Number" value={ticket.order_number} mono />
          <InfoRow label="Holder Name" value={ticket.buyer_name} />
          <InfoRow label="Issued On" value={issuedDate} />
          <InfoRow label="Event" value="Coastal Nganya Awards Night" />
          <InfoRow label="Venue" value="Mamba Village, Mombasa" />
          <InfoRow label="Date" value="Dec 6, 2026 · 2:00 PM EAT" />
          <InfoRow label="Signature" value="Cryptographically verified" accent />
        </div>

        <div className="rounded-xl bg-emerald-950/30 border border-emerald-800/30 px-5 py-4 text-sm text-emerald-300/80 leading-relaxed">
          <strong className="text-emerald-300">Gate Staff:</strong> Admit the holder and mark this
          ticket as <span className="font-mono bg-emerald-950/50 px-1 rounded text-xs">used</span> after scanning.
        </div>
      </div>
    </div>
  );
}

function UsedCard({ ticket }: { ticket: TicketRecord }) {
  return (
    <div className="w-full rounded-3xl bg-[#0a0a0a] border border-amber-900/40 overflow-hidden shadow-2xl">
      <div className="bg-amber-950/60 border-b border-amber-800/40 px-8 py-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">
            Ticket Already Used
          </h1>
          <p className="text-amber-400 text-sm font-medium mt-0.5">
            This ticket has already been scanned at the gate.
          </p>
        </div>
      </div>
      <div className="p-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="Ticket Code" value={ticket.ticket_code} mono />
          <InfoRow label="Holder" value={ticket.buyer_name} />
          <InfoRow label="Tier" value={ticket.tier_name} />
          <InfoRow label="Status" value="USED / SCANNED" accent />
        </div>
        <p className="text-sm text-white/40 leading-relaxed">
          If you believe this is an error, contact{" "}
          <a href="mailto:info@coastalnganyaawards.com" className="text-amber-400 underline">
            info@coastalnganyaawards.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function TamperedCard({ ticket }: { ticket: TicketRecord }) {
  return (
    <div className="w-full rounded-3xl bg-[#0a0a0a] border border-red-900/40 overflow-hidden shadow-2xl">
      <div className="bg-red-950/60 border-b border-red-800/40 px-8 py-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
          <XCircle className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">
            Invalid Signature
          </h1>
          <p className="text-red-400 text-sm font-medium mt-0.5">
            QR signature mismatch — possible counterfeit or tampering.
          </p>
        </div>
      </div>
      <div className="p-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="Ticket Code" value={ticket.ticket_code} mono />
          <InfoRow label="Status" value="SIGNATURE INVALID" accent />
        </div>
        <p className="text-sm text-white/40 leading-relaxed">
          Do not allow gate entry. Alert security staff immediately.
        </p>
      </div>
    </div>
  );
}

function NotFoundCard({ code }: { code: string }) {
  return (
    <div className="w-full rounded-3xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl">
      <div className="bg-zinc-900 border-b border-white/10 px-8 py-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
          <XCircle className="w-7 h-7 text-white/60" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">
            Ticket Not Found
          </h1>
          <p className="text-white/40 text-sm font-medium mt-0.5">
            No ticket found for code:{" "}
            <code className="font-mono text-white/70">{code || "(empty)"}</code>
          </p>
        </div>
      </div>
      <div className="p-8 space-y-4">
        <p className="text-sm text-white/50 leading-relaxed">
          This QR code does not match any issued ticket. It may be counterfeit, from another event,
          or generated outside our system.
        </p>
        <Link
          href="/"
          className="inline-block text-sm text-white/40 underline underline-offset-4 hover:text-white transition-colors"
        >
          Return to homepage
        </Link>
      </div>
    </div>
  );
}

function InvalidCard({ ticket }: { ticket: TicketRecord }) {
  return (
    <div className="w-full rounded-3xl bg-[#0a0a0a] border border-red-900/40 overflow-hidden shadow-2xl">
      <div className="bg-red-950/60 border-b border-red-800/40 px-8 py-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
          <XCircle className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">
            Ticket Invalid
          </h1>
          <p className="text-red-400 text-sm font-medium mt-0.5">
            This ticket has been voided or cancelled.
          </p>
        </div>
      </div>
      <div className="p-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="Ticket Code" value={ticket.ticket_code} mono />
          <InfoRow label="Status" value={ticket.status.toUpperCase()} accent />
          <InfoRow label="Holder" value={ticket.buyer_name} />
          <InfoRow label="Tier" value={ticket.tier_name} />
        </div>
        <p className="text-sm text-white/40 leading-relaxed">
          Contact{" "}
          <a href="mailto:info@coastalnganyaawards.com" className="text-amber-400 underline">
            info@coastalnganyaawards.com
          </a>{" "}
          for assistance.
        </p>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono mb-1">{label}</p>
      <p
        className={`text-sm font-semibold break-all leading-tight ${
          accent
            ? "text-amber-400"
            : mono
              ? "text-white font-mono tracking-wider"
              : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
