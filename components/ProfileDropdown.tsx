"use client";

import UserButton from "@/components/auth/client-user-button";
import { ChevronDown, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const openDropdown = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpen(true);
  };

  const closeDropdown = (delay = 200) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => setOpen(false), delay);
  };

  return (
    <li
      className="relative"
      onMouseEnter={openDropdown}
      onMouseLeave={() => closeDropdown()}
    >
      <button
        className="py-3 px-3 flex items-center gap-2 hover:text-teal-600 transition duration-150"
        aria-expanded={open}
      >
        <UserCircle2 className="w-5 h-5 text-teal-600" />
        <span className="font-medium tracking-wide">MY PROFILE</span>
        <ChevronDown
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2"
          onMouseEnter={openDropdown}
          onMouseLeave={() => closeDropdown()}
        >
          <div className="p-4 border-b border-gray-100">
            <UserButton />
          </div>
          <div className="p-2 space-y-1">
            <Link
              href="/orders"
              className="block px-3 py-2 text-sm rounded-lg hover:bg-teal-50 text-gray-700 hover:text-teal-700 transition"
            >
              My Orders
            </Link>
            
          </div>
        </div>
      )}
    </li>
  );
}
