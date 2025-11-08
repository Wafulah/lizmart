// app/shipping-returns/page.tsx

import Footer from '@/components/layout/footer';
import { Truck, RefreshCw, MapPin, Scale } from 'lucide-react';

const BRAND_GREEN = "text-[#2e7d32]";

export default function ShippingReturnsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Shipping & Returns Policy
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Fast, flexible delivery and clear guidelines for returns and exchanges.
        </p>
      </header>

      <div className="space-y-12">
        
        {/* SHIPPING SECTION */}
        <section className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-[#2e7d32]">
          <div className="flex items-center mb-4">
            <Truck className={`w-8 h-8 ${BRAND_GREEN}`} />
            <h2 className="ml-3 text-2xl font-bold text-gray-900">
              Shipping & Delivery
            </h2>
          </div>
          
          <p className="text-gray-700 mb-6">
            We are committed to processing and delivering your order quickly and reliably across Africa and Europe.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            Delivery Schedule & Fees
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Nairobi County</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">All orders</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#2e7d32]">FREE Delivery (Within 24 Hours)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Nationwide (Outside Nairobi)</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Ksh 3,000/- and Above</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#2e7d32]">FREE Delivery (Within 24 Hours)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Nationwide (Outside Nairobi)</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Below Ksh 3,000/-</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">Delivery fees calculated at checkout based on location.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-start space-x-3">
            <MapPin className={`w-5 h-5 flex-shrink-0 ${BRAND_GREEN}`} />
            <p className="text-sm text-gray-600">
              <b>Pickup Option:</b> You may also pick up your order from our office at Kenya Cinema Plaza, 4th Floor, Room No. 4--4B.
            </p>
          </div>
        </section>

        {/* RETURNS SECTION */}
        <section className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-yellow-500">
          <div className="flex items-center mb-4">
            <RefreshCw className="w-8 h-8 text-yellow-600" />
            <h2 className="ml-3 text-2xl font-bold text-gray-900">
              Returns, Exchanges, and Refunds
            </h2>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            Eligibility for Return
          </h3>
          <p className="text-gray-700 mb-4">
            Due to the nature of our health and wellness supplements and cosmetics, we maintain strict quality and hygiene standards.
          </p>
          <ul className="list-disc ml-5 text-gray-700 space-y-2">
            <li>The item must be <b> unopened, unused, and in its original sealed packaging </b>.</li>
            <li>The return request must be initiated within <b>7 days </b> of the delivery date.</li>
            <li>Items that have been opened or consumed are <b> not eligible </b> for return.</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            How to Initiate a Return
          </h3>
          <div className="flex items-start space-x-3">
            <Scale className={`w-5 h-5 flex-shrink-0 ${BRAND_GREEN}`} />
            <p className="text-sm text-gray-600">
              Please contact our support team immediately at <b>+254 727 717 019 </b> (Call/WhatsApp) or <a href="mailto:info@lizmartNaturals.com" className="text-[#2e7d32] hover:underline">info@lizmartNaturals.com</a>. Provide your order number and clear photographs of the product packaging. Refunds are processed after successful inspection of the returned goods.
            </p>
          </div>
        </section>
        
      </div>
       <div className="w-screen">
  <Footer />
      </div>
    </div>
  );
}