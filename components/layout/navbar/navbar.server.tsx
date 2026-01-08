
import type { Menu } from "@/lib/neondb/types";
import Image from "next/image";
import Link from "next/link";

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
          <Image src="/logo.webp" alt="Lizmart Naturals Logo" width="80" height="80" />
          <div className="ml-2 flex-none text-sm font-medium uppercase hidden sm:hidden md:hidden lg:block">
            Lizmart Naturals
          </div>
        </Link>
        <Link href="/" prefetch>
          <Image src="/till.webp" alt="Lizmart Naturals Logo" width="130" height="130" />
        </Link>
        <ul className="hidden gap-6 text-sm md:flex md:items-center">          
          {menu.map((item) => (
            <li key={item.title}>
              <Link href={item.path} prefetch={false}>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
