"use server";

import { currentUser } from "@/lib/auth";
import Link from "next/link";
import { SignOut } from "./sign-out";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default async function UserButton() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 border border-gray-200 rounded-xl bg-gray-50">
        <p className="text-gray-700 mb-2 font-medium">
          You&apos;re not logged in
        </p>
        <Link
          href="/dashboard/login"
          className="text-sm text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md transition"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm sm:inline-flex text-gray-700">
        {user.email}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={
                  user.image ??
                  `https://api.dicebear.com/9.x/thumbs/svg?seed=${
                    user.name || user.email || "guest"
                  }`
                }
                alt={user.name ?? ""}
              />
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-muted-foreground text-xs leading-none">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem>
            <SignOut />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
