"use server";

export const dynamic = "force-dynamic";

import ProfileDropdown from "@/components/ProfileDropdown";
import { currentUser } from "@/lib/auth";

export default async function ServerProfileSection() {
  const user = await currentUser();

  
  const serverUser = user
    ? {
        id: user.id,
        name: user.name ?? null,
        email: user.email ?? null,
        image: user.image ?? null,
      }
    : null;

  return <ProfileDropdown serverUser={serverUser} />;
}
