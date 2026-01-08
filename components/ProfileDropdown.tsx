"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, UserCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { SignOut } from "@/components/auth/sign-out";
import { Avatar, AvatarImage } from "./ui/avatar";

export default function ProfileDropdown() {
  const { data: session, status } = useSession();
  const user = session?.user ?? null;

  const [open, setOpen] = useState(false);
  const closeTimeout = useRef<number | null>(null);

  const openDropdown = () => {
    if (closeTimeout.current) window.clearTimeout(closeTimeout.current);
    setOpen(true);
  };

  const closeDropdown = (delay = 200) => {
    if (closeTimeout.current) window.clearTimeout(closeTimeout.current);
    closeTimeout.current = window.setTimeout(() => setOpen(false), delay);
  };

  // handle display name and image
  const displayName = user?.name ?? user?.email ?? "Guest";
  const avatarSrc =
    user?.image ??
    `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(displayName)}&randomizeIds=true`;

  return (
    <li
      className="relative"
      onMouseEnter={openDropdown}
      onMouseLeave={() => closeDropdown()}
    >
      <button
        className="py-3 px-3 flex items-center gap-2 hover:text-teal-600 transition duration-150"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
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
          className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden"
          onMouseEnter={openDropdown}
          onMouseLeave={() => closeDropdown()}
        >
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarSrc} alt={displayName} />
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-800">{displayName}</p>
              <p className="text-xs text-gray-500">
                {user?.email ?? "Not logged in"}
              </p>
            </div>
          </div>

          <div className="p-2">
            {status === "loading" ? (
              <p className="text-center text-sm text-gray-500 py-2">
                Checking session...
              </p>
            ) : !user ? (
              <Link
                href="/dashboard/login"
                className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-teal-50"
                
              >
                Login
              </Link>
            ) : (
              <>
                <Link
                  href="/orders"
                  className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-teal-50"
                >
                  My Orders
                </Link>
                <div className="px-3 py-2">
                  <SignOut />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
