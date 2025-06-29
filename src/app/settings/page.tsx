'use client';

import useAuth from "@/hooks/use-auth";

function SettingsPage() {
  const {isLoggedIn, user} = useAuth();

  return (
    isLoggedIn && <div>Settings for {user?.name}</div>
  );
}

export default SettingsPage;
