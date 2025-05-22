import React, { createContext, useContext, useState, useEffect } from "react";

type Profile = {
  takId: string | undefined;
  name?: string;
};

type ProfileContextType = {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (profile: Profile) => void;
  updateTakId: (takId: string) => void;
  clearProfile: () => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      try {
        setProfileState(JSON.parse(storedProfile));
      } catch (error) {
        console.error("Failed to parse stored profile:", error);
        localStorage.removeItem("userProfile");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (profile) {
      localStorage.setItem("userProfile", JSON.stringify(profile));
    }
  }, [profile]);

  const setProfile = (newProfile: Profile) => {
    setProfileState(newProfile);
  };

  const updateTakId = (takId: string) => {
    setProfileState((prev) => {
      if (!prev) return { takId };
      return { ...prev, takId };
    });
  };

  const clearProfile = () => {
    localStorage.removeItem("userProfile");
    setProfileState(null);
  };

  return (
    <ProfileContext.Provider
      value={{ profile, isLoading, setProfile, updateTakId, clearProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
