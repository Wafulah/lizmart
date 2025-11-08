// app/checkout/layout.tsx

import Footer from '@/components/layout/footer';
import { Suspense } from 'react'; 
import CheckoutLoading from './loading'; 

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
    
        <Suspense fallback={<CheckoutLoading />}>
          {children}
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}