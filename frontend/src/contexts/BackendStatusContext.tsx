"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Keep-alive interval: ping every 10 minutes to prevent cold start
const KEEP_ALIVE_INTERVAL = 10 * 60 * 1000; // 10 minutes
// Max retries before giving up
const MAX_RETRIES = 5;
// Initial retry delay (doubles each retry)
const INITIAL_RETRY_DELAY = 2000; // 2 seconds

type BackendStatus = "checking" | "waking" | "ready" | "error";

interface BackendStatusContextType {
  status: BackendStatus;
  isReady: boolean;
  retryCount: number;
  lastPingTime: number | null;
  checkBackend: () => Promise<boolean>;
}

const BackendStatusContext = createContext<BackendStatusContextType | undefined>(undefined);

export function BackendStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<BackendStatus>("checking");
  const [retryCount, setRetryCount] = useState(0);
  const [lastPingTime, setLastPingTime] = useState<number | null>(null);

  const checkBackend = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${API_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setStatus("ready");
        setLastPingTime(Date.now());
        setRetryCount(0);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Initial wake-up with retry logic
  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const attemptWakeUp = async (attempt: number) => {
      if (!mounted) return;

      if (attempt === 0) {
        setStatus("checking");
      } else {
        setStatus("waking");
      }
      setRetryCount(attempt);

      const success = await checkBackend();

      if (!mounted) return;

      if (success) {
        setStatus("ready");
      } else if (attempt < MAX_RETRIES) {
        // Exponential backoff: 2s, 4s, 8s, 16s, 32s
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        retryTimeout = setTimeout(() => attemptWakeUp(attempt + 1), delay);
      } else {
        setStatus("error");
      }
    };

    attemptWakeUp(0);

    return () => {
      mounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [checkBackend]);

  // Keep-alive ping every 10 minutes while user is active
  useEffect(() => {
    if (status !== "ready") return;

    const keepAliveInterval = setInterval(() => {
      // Only ping if the page is visible
      if (document.visibilityState === "visible") {
        checkBackend();
      }
    }, KEEP_ALIVE_INTERVAL);

    // Also ping when page becomes visible after being hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && lastPingTime) {
        const timeSinceLastPing = Date.now() - lastPingTime;
        // If it's been more than 10 minutes since last ping, ping now
        if (timeSinceLastPing > KEEP_ALIVE_INTERVAL) {
          checkBackend();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(keepAliveInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, lastPingTime, checkBackend]);

  return (
    <BackendStatusContext.Provider
      value={{
        status,
        isReady: status === "ready",
        retryCount,
        lastPingTime,
        checkBackend,
      }}
    >
      {children}
    </BackendStatusContext.Provider>
  );
}

export function useBackendStatus() {
  const context = useContext(BackendStatusContext);
  if (context === undefined) {
    throw new Error("useBackendStatus must be used within a BackendStatusProvider");
  }
  return context;
}
