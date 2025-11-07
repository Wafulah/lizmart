// components/auth/server-profile-section.tsx
import ProfileDropdown from "@/components/ProfileDropdown";
import { currentUser } from "@/lib/auth";

export default async function ServerProfileSection() {
  const user = await currentUser();

  // Only pass serializable plain data to the client component
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
