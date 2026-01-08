"use client";

import type { Menu } from "@/lib/neondb/types";
import CartModal from "components/cart/modal"; // client component
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu"; // should be a client component
import Search, { SearchSkeleton } from "./search"; // client component

type Props = {
  menu: Menu[];
};

export default function NavbarClient({ menu }: Props) {
  const pathname = usePathname() ?? "";

  // hide on admin dashboard
  if (pathname.startsWith("/dashboard/admin")) return null;

  
  return (
    <nav className="relative flex items-center justify-between p-4 lg:px-6">
      <div className="block flex-none md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={menu} />
        </Suspense>
      </div>

      <div className="flex w-full items-center">
        <div className="flex w-full md:w-1/3">
          <Link
            href="/"
            prefetch={true}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
          >
            <Image src="/logo.webp" alt="Lizmart Naturals Logo" width="80" height="80" className="rounded-md" />
            <div className="ml-2 flex-none text-sm font-medium uppercase hidden sm:hidden md:hidden lg:block">
             Lizmart Naturals
            </div>
          </Link>
          <Link href="/" prefetch={true}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6 mt-5" >
          <Image src="/till.webp" alt="Lizmart Naturals Logo" width="130" height="130" />
        </Link>

          {menu.length ? (
            <ul className="hidden gap-6 text-sm md:flex md:items-center">
              {menu.map((item: Menu) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    prefetch={false}
                    className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="hidden justify-center md:flex md:w-1/3">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>

        <div className="flex justify-end md:w-1/3">
          <CartModal />
        </div>
      </div>
    </nav>
  );
}
