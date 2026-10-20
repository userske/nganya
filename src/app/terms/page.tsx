import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Terms of Voting & Ticket Sales — Coastal Nganya Awards",
  description: "Official terms and conditions governing public voting, ticket reservations, gate check-in, and refunds.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28 text-white/70 leading-relaxed text-sm">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-2">
              Terms of Voting & Ticket Sales
            </h1>
            <p className="text-xs text-white/40 font-mono">
              Last Updated: October 2025 • Coastal Nganya Awards Night
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                1. Public Voting Integrity & Rules
              </h2>
              <p>
                Each verified voter is entitled to exactly <strong>one vote per award category</strong>. Once cast and confirmed by the voter, votes are immediately permanent and immutable in the cryptographic database. Votes cannot be revoked, edited, or reallocated.
              </p>
              <p>
                Attempts to circumvent voting limits via automated bots, disposable email generators, or identity spoofing are prohibited. The awards committee reserves the right to void fraudulently generated votes upon audit review.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                2. Guest Ticket Checkout & Reservations
              </h2>
              <p>
                Ticket sales are processed as a guest checkout requiring no account creation. When an order is initiated, ticket stock is held under an atomic 10-minute reservation window while payment is finalized via Paystack (M-Pesa or Card).
              </p>
              <p>
                If payment is not confirmed before the reservation window elapses, the reservation is released back to the general capacity pool.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                3. Gate Admission & QR Ticket Security
              </h2>
              <p>
                Each ticket issued features a cryptographically signed HMAC QR payload. A ticket is valid for single admission only. At gate entry, the scanner marks the ticket as &quot;used&quot;. Subsequent scan attempts of duplicate or forwarded QR codes will be denied entry by security personnel.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                4. Cancellation & Refund Policy
              </h2>
              <p>
                All ticket purchases are final. In the event of event postponement or force majeure rescheduling by organizers, tickets remain valid for the rescheduled date.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
