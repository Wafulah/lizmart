// app/terms-conditions/page.tsx

import { Gavel, Globe, ShieldCheck, HeartHandshake, DollarSign, Truck } from 'lucide-react';

const BRAND_GREEN = "text-[#2e7d32]";

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Terms & Conditions
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Governing your use of the Lizmart Naturals platform and all purchases.
        </p>
      </header>

      <div className="space-y-10 text-gray-700">
        
        {/* Section 1: Introduction */}
        <section>
          <div className="flex items-center mb-3">
            <Gavel className={`w-6 h-6 ${BRAND_GREEN}`} />
            <h2 className="ml-3 text-xl font-bold text-gray-900">1. Introduction and Acceptance of Terms</h2>
          </div>
          <p className="pl-9">
            These Terms and Conditions ("T&Cs") govern your relationship with LIZMART NATURALS ("The Company") and your use of our e-commerce platform. By placing an order, you acknowledge that you have read, understood, and agreed to be bound by these T&Cs. The Company is a fully registered distributor operating since 2023, based in Nairobi, Kenya.
          </p>
        </section>

        {/* Section 2: Product Integrity and Disclaimers */}
        <section>
          <div className="flex items-center mb-3">
            <ShieldCheck className={`w-6 h-6 ${BRAND_GREEN}`} />
            <h2 className="ml-3 text-xl font-bold text-gray-900">2. Product Integrity and Disclaimers</h2>
          </div>
          <ul className="pl-9 list-disc ml-5 space-y-2">
            <li>
              <b>Quality Commitment:</b> We commit to an <b>uncompromising devotion </b> to sourcing well-researched, natural ingredients and formulas that exceed global industry standards.
            </li>
            <li>
              <b>Disclaimer:</b> The products sold are dietary supplements and cosmetics. The information provided on our Platform is for **educational purposes only** and should not be considered medical advice. Always consult with a qualified health professional before starting any new supplement regime.
            </li>
          </ul>
        </section>

        {/* Section 3: Ordering and Payment */}
        <section>
          <div className="flex items-center mb-3">
            <DollarSign className={`w-6 h-6 ${BRAND_GREEN}`} />
            <h2 className="ml-3 text-xl font-bold text-gray-900">3. Ordering, Pricing, and Payment</h2>
          </div>
          <ul className="pl-9 list-disc ml-5 space-y-2">
            <li>
              <b>Pricing:</b> All prices are listed in <b>Kenyan Shillings (KES)</b> and are final upon checkout, subject to any statutory tax changes.
            </li>
            <li>
              <b>Payment Confirmation:</b> Order processing commences only upon successful verification of payment, whether through our automated M-Pesa STK push or verified Till/Paybill transfer.
            </li>
          </ul>
        </section>
        
        {/* Section 4: Delivery and Risk */}
        <section>
          <div className="flex items-center mb-3">
            <Truck className={`w-6 h-6 ${BRAND_GREEN}`} />
            <h2 className="ml-3 text-xl font-bold text-gray-900">4. Delivery, Fulfillment, and Risk of Loss</h2>
          </div>
          <p className="pl-9">
            We aim for prompt fulfillment, targeting <b>Nationwide delivery within 24 hours</b> from dispatch. The risk of loss or damage to goods passes to the Customer upon our delivery of the items to the designated carrier for shipment.
          </p>
        </section>

        {/* Section 5: Governing Law */}
        <section>
          <div className="flex items-center mb-3">
            <Globe className={`w-6 h-6 ${BRAND_GREEN}`} />
            <h2 className="ml-3 text-xl font-bold text-gray-900">5. Governing Law</h2>
          </div>
          <p className="pl-9">
            These Terms and Conditions and any disputes arising from them shall be governed by and construed in accordance with the laws of the **Republic of Kenya**.
          </p>
        </section>
      </div>
      
      <footer className="mt-12 text-center">
        <HeartHandshake className={`w-12 h-12 mx-auto ${BRAND_GREEN}`} />
        <p className="mt-3 text-sm text-gray-500">
          Last Updated: November 8, 2025.
        </p>
      </footer>
    </div>
  );
}