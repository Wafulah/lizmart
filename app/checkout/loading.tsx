import { Loader2 } from 'lucide-react';


const BRAND_GREEN = "text-[#2e7d32]";

export default function CheckoutLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full text-center p-8 md:p-10 rounded-xl bg-white shadow-md">
        
      
        <Loader2 className={`w-10 h-10 mx-auto animate-spin ${BRAND_GREEN}`} />

        <p className="mt-4 text-xl font-semibold text-gray-700">
          Loading Order Status...
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Please wait while we confirm your checkout details.
        </p>
        
      </div>
    </div>
  );
}