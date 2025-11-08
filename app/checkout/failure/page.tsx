"use client";

import Footer from "@/components/layout/footer";
import { XCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";


const ERROR_RED = "text-red-600";
const BRAND_GREEN_BUTTON = "bg-[#2e7d32]"; 

export default function CheckoutFailurePage() {
  const searchParams = useSearchParams();
  const cartId = searchParams.get("cartId") || "default";

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4">
      <div className="max-w-md w-full text-center p-8 md:p-10 border border-red-100 rounded-xl shadow-lg bg-white">
        
        {/* Failure Icon */}
        <XCircle className={`w-20 h-20 mx-auto ${ERROR_RED}`} />

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Order Not Placed
        </h1>

        <p className="mt-3 text-lg text-red-700">
          We encountered a technical issue while processing your checkout.
        </p>

        <p className="mt-4 text-sm text-gray-600">
          Your cart contents have been saved. Please review the details and try initiating the checkout process again.
        </p>

        <div className="mt-8 space-y-4">
          
          {/* Primary Action Button (Green) */}
          <Link
            href={`/cart/${cartId}`}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white ${BRAND_GREEN_BUTTON} hover:bg-green-700 transition duration-150`}
          >
            <ShoppingCart className="w-5 h-5" />
            Return to Cart
          </Link>

          {/* Secondary Action (Contact Support) */}
          <p className="text-xs text-gray-500">
            If the problem persists, please contact support.
          </p>
          
        </div>
      </div>
    
    </div>
  );
}