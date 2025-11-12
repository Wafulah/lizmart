
import Link from "next/link";
import Image from "next/image";
import type { Menu } from "@/lib/neondb/types";

type NavbarProps = {
  menu: Menu[];
};

export function NavbarServer({ menu }: NavbarProps) {
  

  return (
    <nav className="relative flex items-center justify-between p-4 lg:px-6">
      <div className="flex-none md:hidden">
        {/* leave MobileMenu out here or supply via props */}
      </div>
      <div className="flex w-full items-center">
        <Link href="/" prefetch>
          <Image src="/logo.png" alt="Lizmart Naturals Logo" width="40" height="40" />
          <div className="ml-2 text-sm font-medium uppercase md:hidden lg:block">
            Lizmart Naturals
          </div>
        </Link>
        <ul className="hidden gap-6 text-sm md:flex md:items-center">
          {menu.map((item) => (
            <li key={item.title}>
              <Link href={item.path} prefetch>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
