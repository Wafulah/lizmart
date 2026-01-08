import { getCollections } from "@/actions/api/get-collections";
import { getHealthTopics } from "@/actions/api/get-health-topics";
import { getServerSession } from "next-auth";
import FullCommerceNavbar from "@/components/layout/navbar/category-menu";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { getCart, getMenu } from '@/lib/neondb';
import { CartProvider } from 'components/cart/cart-context';
import NavbarClient from "components/layout/navbar/NavbarClient";
import { WelcomeToast } from 'components/welcome-toast';
import { GeistSans } from 'geist/font/sans';
import { baseUrl } from 'lib/utils';
import { SessionProvider } from 'next-auth/react';
import { ReactNode, Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

import { Toaster } from 'sonner';
import './globals.css';

const { SITE_NAME } = process.env;

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME!,
    template: `%s | ${SITE_NAME}`
  },
  robots: {
    follow: true,
    index: true
  }
};

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  
  const cart = getCart();
  const menu = await getMenu("next-js-frontend-header-menu");
  const [collections, healthTopics] = await Promise.all([
    getCollections(),
    getHealthTopics(), 
  ]);
  const session = await getServerSession();
  


  return (
    <html lang="en" className={`${GeistSans.variable} light`}>
      <body className={`${GeistSans.variable} bg-neutral-50 text-black selection:bg-teal-300`}>
        <ThemeProvider>
        <CartProvider cartPromise={cart}>
            <Suspense fallback={null}>
                <NavbarClient menu={menu} />
            </Suspense>
          <main>
            <SessionProvider
  session={session}
  refetchOnWindowFocus={false}  
  refetchInterval={0}           
>
            <FullCommerceNavbar collections={collections} healthTopics={healthTopics} />
            </SessionProvider>
            <div  className="my-6 w-full h-2"/>
            {children}
            <Toaster closeButton />
            <WelcomeToast />
          </main>
        </CartProvider>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics/>
      </body>
    </html>
  );
}
