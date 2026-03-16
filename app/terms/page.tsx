import Link from 'next/link';

export const metadata = { title: 'Terms & Conditions | QM Beauty' };

export default function TermsPage() {
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
          <h1 className="font-serif text-3xl text-[#4a3728]">Terms &amp; Conditions</h1>
          <p className="mt-3 text-[#8b7356] text-sm leading-relaxed">
            Please read these terms carefully before using our website or placing an order with QM Beauty.
          </p>
        </div>

        <div className="space-y-8 text-sm text-[#4a3728] leading-relaxed">

          <Section title="1. About QM Beauty">
            <p>
              QM Beauty is a beauty and wellness brand based in Dar es Salaam, Tanzania. We provide premium
              skincare products, haircare products, and professional beauty services including spa treatments,
              facials, massage, and more. Our physical location is in Oysterbay, Dar es Salaam.
            </p>
          </Section>

          <Section title="2. Orders & Products">
            <ul className="space-y-2 list-disc list-inside text-[#5a4535]">
              <li>All orders are subject to product availability.</li>
              <li>Prices are displayed in Tanzanian Shillings (Tsh) and include applicable taxes.</li>
              <li>We reserve the right to refuse or cancel any order at our discretion.</li>
              <li>Product images are for illustration purposes; slight variations in colour or packaging may occur.</li>
              <li>We verify all prices server-side — any discrepancy between the displayed price and our records will result in the order being cancelled and you being notified.</li>
            </ul>
          </Section>

          <Section title="3. Delivery">
            <ul className="space-y-2 list-disc list-inside text-[#5a4535]">
              <li><strong>Store Pickup:</strong> Free. Orders are ready within 24 hours from our Oysterbay location.</li>
              <li><strong>Home Delivery:</strong> 5,000 Tsh flat fee. Available within Dar es Salaam only. Delivery takes 2–3 business days.</li>
              <li>We are not responsible for delays caused by factors outside our control (traffic, weather, third-party couriers).</li>
              <li>Risk of loss or damage passes to you upon delivery.</li>
            </ul>
          </Section>

          <Section title="4. Payments">
            <ul className="space-y-2 list-disc list-inside text-[#5a4535]">
              <li>We accept mobile money (M-Pesa, Tigo Pesa, Airtel Money, HaloPesa), bank transfer, cash on delivery, and WhatsApp orders.</li>
              <li>Mobile money payments are processed securely through Selcom.</li>
              <li>Cash on Delivery is only available for home delivery orders within Dar es Salaam.</li>
              <li>Payment must be completed before an order is dispatched (except Cash on Delivery).</li>
            </ul>
          </Section>

          <Section title="5. Returns & Refunds">
            <ul className="space-y-2 list-disc list-inside text-[#5a4535]">
              <li>We accept returns within <strong>7 days</strong> of receipt for unopened, unused products in original packaging.</li>
              <li>To initiate a return, contact us via WhatsApp at +255 657 120 151.</li>
              <li>Refunds are processed within 5–7 business days to your original payment method.</li>
              <li>We do not accept returns on opened skincare or haircare products for hygiene reasons, unless the product is defective.</li>
              <li>Defective or incorrect products will be replaced or fully refunded at no cost to you.</li>
            </ul>
          </Section>

          <Section title="6. Services & Appointments">
            <ul className="space-y-2 list-disc list-inside text-[#5a4535]">
              <li>Service prices vary and are confirmed at the time of booking.</li>
              <li>Please arrive 10 minutes before your scheduled appointment.</li>
              <li>Cancellations must be made at least <strong>24 hours</strong> in advance to avoid a cancellation fee.</li>
              <li>Late arrivals may result in a shortened service time with no price adjustment.</li>
            </ul>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              All content on this website — including text, images, logos, and branding — is owned by QM Beauty
              and may not be copied, reproduced, or redistributed without written permission.
            </p>
          </Section>

          <Section title="8. Privacy">
            <p>
              We collect and use your personal information in accordance with our{' '}
              <Link href="/privacy" className="text-[#c4a882] underline hover:text-[#4a3728]">Privacy Policy</Link>.
              By using our website, you consent to that collection and use.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              To the maximum extent permitted by Tanzanian law, QM Beauty is not liable for any indirect,
              incidental, or consequential damages arising from your use of our products or services.
              Our total liability shall not exceed the amount you paid for the order in question.
            </p>
          </Section>

          <Section title="10. Changes to These Terms">
            <p>
              We may update these terms from time to time. Changes are effective immediately upon posting to
              this page. Continued use of our website constitutes acceptance of the updated terms.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Questions about these terms? Reach us at:
            </p>
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
