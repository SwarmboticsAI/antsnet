import { useProfile } from "@/providers/profile-provider";
import { ProfileSetup } from "@/components/profile-setup";
import { useEffect, useState } from "react";

export function ProfileSetupWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, isLoading } = useProfile();
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show nothing during SSR or initial load to avoid hydration mismatch
  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show profile setup if no takId is available
  if (!profile?.takId) {
    return <ProfileSetup />;
  }

  // Render children if takId is available
  return <>{children}</>;
}
