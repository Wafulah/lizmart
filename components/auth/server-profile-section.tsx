
import UserButton from "@/components/auth/client-user-button";
import ProfileDropdown from "@/components/ProfileDropdown";

export default async function ServerProfileSection() {
  // This runs on the server, so you can safely use your async server UserButton
  return <ProfileDropdown userButton={<UserButton />} />;
}
