"use client";

import Footer from "@/components/layout/footer";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";


const BRAND_GREEN = "text-[#2e7d32]";
const BRAND_YELLOW = "bg-[#fbc02d]";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderId") || "N/A";

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4">
      <div className="max-w-md w-full text-center p-8 md:p-10 border border-green-100 rounded-xl shadow-lg bg-white">
        
        {/* Success Icon */}
        <CheckCircle2 className={`w-20 h-20 mx-auto ${BRAND_GREEN}`} />

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Order Placed Successfully!
        </h1>

        <p className="mt-3 text-lg text-gray-700">
          We have received your order and initiated the payment request (STK Push).
        </p>

        {/* Order ID Confirmation */}
        <p className="mt-4 text-sm font-medium text-gray-500">
          Order Reference: <span className="font-semibold text-gray-800">{orderNumber}</span>
        </p>

        <div className="mt-8 space-y-4">
          
          <h2 className="text-xl font-semibold text-gray-800">
            What's next?
          </h2>
          
          <p className="text-gray-600">
            You can now track the status of your payment and delivery.
          </p>

          {/* Primary Action Button (Yellow/Gold) */}
          <Link
            href="/orders"
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white ${BRAND_YELLOW} hover:bg-yellow-600 transition duration-150`}
          >
            <ShoppingBag className="w-5 h-5" />
            Go to My Orders to View Status
          </Link>
          
        </div>
      </div>
   
    </div>
  );
}