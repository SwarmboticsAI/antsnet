"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
  useState,
} from "react";
import { Session, Config } from "@eclipse-zenoh/zenoh-ts";

type ZenohStatus = "disconnected" | "connecting" | "connected" | "error";

interface ZenohContextType {
  session: Session | null;
  status: ZenohStatus;
  isConnected: boolean;
}

const ZenohContext = createContext<ZenohContextType | null>(null);

const createZenohSession = async (config: Config): Promise<Session> => {
  return await Session.open(config);
};

interface ZenohProviderProps {
  children: ReactNode;
  configUrl?: string;
}

export const ZenohProvider: React.FC<ZenohProviderProps> = ({
  children,
  configUrl,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<ZenohStatus>("disconnected");
  const connectionAttemptRef = useRef<boolean>(false);
  const hasInitializedRef = useRef<boolean>(false);
  const sessionRef = useRef<Session | null>(null);

  // Update the ref whenever session changes
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    console.log("ZenohProvider initializing");

    const connectToZenoh = async () => {
      // Skip if already connected
      if (session) return;

      // Skip if connection attempt in progress
      if (connectionAttemptRef.current) return;
      connectionAttemptRef.current = true;

      setStatus("connecting");

      try {
        console.log("Connecting to Zenoh...");
        const url =
          configUrl || process.env.NEXT_PUBLIC_ZENOH_REMOTE_API_URL || "";
        const config = new Config(url);
        const zenohSession = await createZenohSession(config);

        setSession(zenohSession);
        sessionRef.current = zenohSession;
        setStatus("connected");

        console.log("Zenoh session established.");
      } catch (err) {
        setStatus("error");
        console.log("Error connecting to Zenoh: ", err);
      } finally {
        connectionAttemptRef.current = false;
      }
    };

    connectToZenoh();

    // Clean up only when component unmounts, not during re-renders
    return () => {
      console.log("ZenohProvider unmounting, cleaning up Zenoh session...");
      // Use the ref to get the latest session value
      const currentSession = sessionRef.current;
      if (currentSession) {
        try {
          (currentSession as unknown as { close: () => void }).close();
          console.log("Zenoh session closed.");
        } catch (e) {
          console.error("Error closing Zenoh session:", e);
        } finally {
          sessionRef.current = null;
        }
      }
    };
  }, []); // Empty dependency array to run only once and never re-execute

  const contextValue: ZenohContextType = {
    session,
    status,
    isConnected: status === "connected",
  };

  return (
    <ZenohContext.Provider value={contextValue}>
      {children}
    </ZenohContext.Provider>
  );
};

// Hook to use the Zenoh context
export const useZenoh = (): ZenohContextType => {
  const context = useContext(ZenohContext);

  if (!context) {
    throw new Error("useZenoh must be used within a ZenohProvider");
  }

  return context;
};

export default ZenohProvider;
