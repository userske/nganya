import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Privacy Policy (KDPA Compliant) — Coastal Nganya Awards",
  description: "How we collect, protect, and process voter verification emails, M-Pesa contact data, and telemetry under Kenya Data Protection Act.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28 text-white/70 leading-relaxed text-sm">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-2">
              Privacy Policy & Data Protection
            </h1>
            <p className="text-xs text-white/40 font-mono">
              In compliance with the Kenya Data Protection Act (2019)
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                1. Data Controller & Scope
              </h2>
              <p>
                The <strong>Coastal Nganya Awards Committee</strong> acts as the Data Controller regarding personal data collected on <code>coastalnganyaawards.com</code>. We are committed to protecting your privacy in accordance with Kenyan law and international privacy standards.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                2. Data We Collect and Why
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Voter Verification Emails:</strong> Used exclusively to enforce the one-voter-one-vote rule and authenticate passwordless 6-digit OTP codes. Voter emails are never sold, rented, or published publicly.
                </li>
                <li>
                  <strong>Ticket Buyer Contact Details:</strong> Name, email, and phone number collected solely for ticket issuance, digital QR dispatch, gate verification, and critical event updates.
                </li>
                <li>
                  <strong>Payment Information:</strong> Financial transactions (M-Pesa and Card) are handled directly by Paystack, a certified PCI-DSS Level 1 payment processor. We do not store credit card numbers or M-Pesa PINs.
                </li>
                <li>
                  <strong>Telemetry & Anti-Fraud Logs:</strong> We store a one-way salted hash of your IP address (<code>ip_hash</code>) to detect bot bursts and preserve fair voting. Raw IP addresses are not stored in voting records.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                3. Your Rights Under the Kenya Data Protection Act
              </h2>
              <p>
                You have the right to request access to your personal data, request correction of erroneous data, or request deletion of contact records following the conclusion of the awards gala, subject to statutory audit obligations.
              </p>
              <p>
                For data protection inquiries, email our compliance officer at <a href="mailto:info@coastalnganyaawards.com" className="text-amber-400 underline underline-offset-4">info@coastalnganyaawards.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}
