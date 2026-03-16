import Link from 'next/link';

export const metadata = { title: 'Privacy Policy | QM Beauty' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2]">

      {/* Header */}
      <div className="bg-white border-b border-[#ede4d8]">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#8b7356] hover:text-[#4a3728] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to QM Beauty
          </Link>
          <span className="text-xs text-[#a89070]">Last updated: March 2025</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#c4a882] mb-2">Legal</p>
          <h1 className="font-serif text-3xl text-[#4a3728]">Privacy Policy</h1>
          <p className="mt-3 text-[#8b7356] text-sm leading-relaxed">
            Your privacy matters to us. This policy explains what information we collect, how we use it,
            and how we keep it safe.
          </p>
        </div>

        <div className="space-y-8 text-sm text-[#4a3728] leading-relaxed">

          <Section title="1. Information We Collect">
            <p>When you place an order or contact us, we may collect:</p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside text-[#5a4535]">
              <li>Full name and contact details (phone number, email address)</li>
              <li>Delivery address</li>
              <li>Order history and product preferences</li>
              <li>Payment transaction references (we do not store card or mobile money PIN details)</li>
              <li>WhatsApp messages when you contact us via WhatsApp</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="space-y-1.5 list-disc list-inside text-[#5a4535]">
              <li>To process and fulfil your orders</li>
              <li>To contact you about your order status or appointment</li>
              <li>To send order confirmations and delivery updates</li>
              <li>To improve our products and services</li>
              <li>To respond to your enquiries and customer support requests</li>
            </ul>
            <p className="mt-3">We do <strong>not</strong> sell your personal data to third parties.</p>
          </Section>

          <Section title="3. Payment Data">
            <p>
              Mobile money payments are processed by <strong>Selcom</strong>, a licensed Tanzanian payment
              gateway. We only receive a transaction reference and status — we never see or store your mobile
              money PIN or bank credentials. Selcom's own privacy policy governs their data handling.
            </p>
          </Section>

          <Section title="4. WhatsApp Communication">
            <p>
              If you choose to place an order or contact us via WhatsApp, your messages are handled through
              WhatsApp (Meta). We use the content of those messages only to fulfil your request and provide
              customer support. We do not share WhatsApp conversation data with third parties.
            </p>
          </Section>

          <Section title="5. Data Storage & Security">
            <ul className="space-y-1.5 list-disc list-inside text-[#5a4535]">
              <li>Your data is stored securely on Supabase (PostgreSQL) servers.</li>
              <li>We use HTTPS encryption for all data transmitted via our website.</li>
              <li>Access to customer data is restricted to authorised QM Beauty staff only.</li>
              <li>We retain order data for up to 3 years for accounting and legal compliance purposes.</li>
            </ul>
          </Section>

          <Section title="6. Cookies">
            <p>
              Our website uses only essential cookies (e.g. your shopping cart stored in localStorage).
              We do not use tracking cookies or third-party advertising cookies.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the right to:</p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside text-[#5a4535]">
              <li>Request a copy of the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal obligations)</li>
              <li>Opt out of any marketing communications</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us via WhatsApp or email below.</p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              Our website and services are not directed at children under 13. We do not knowingly collect
              personal information from children.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes
              via our website or WhatsApp. Continued use of our services after changes are posted constitutes
              your acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>For any privacy-related questions or requests:</p>
            <div className="mt-3 p-4 bg-white rounded-xl border border-[#ede4d8] space-y-1 text-[#5a4535]">
              <p><strong>QM Beauty</strong></p>
              <p>Oysterbay, Dar es Salaam, Tanzania</p>
              <p>WhatsApp: +255 657 120 151</p>
              <p>
                Email:{' '}
                <a href="mailto:hello@qmbeauty.africa" className="text-[#c4a882] hover:underline">
                  hello@qmbeauty.africa
                </a>
              </p>
            </div>
          </Section>

          <div className="pt-4 border-t border-[#ede4d8]">
            <Link href="/terms" className="text-xs text-[#c4a882] hover:underline">
              View our Terms &amp; Conditions →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-[#4a3728] text-base mb-3">{title}</h2>
      <div className="text-[#5a4535] space-y-2">{children}</div>
    </div>
  );
}
