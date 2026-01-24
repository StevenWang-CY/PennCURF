"use client";

import { useBackendStatus } from "@/contexts/BackendStatusContext";

/**
 * Component that shows backend status when it's waking up.
 * Render's free tier spins down after ~15 min of inactivity,
 * causing 30-60s cold starts. This component shows a friendly
 * message while the backend is warming up.
 */
export default function BackendWakeUp() {
  const { status, retryCount } = useBackendStatus();

  // Don't show anything if backend is ready
  if (status === "ready") {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-[#011F5B] to-[#003366] text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        {status === "checking" && (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span className="text-sm">Connecting to server...</span>
          </>
        )}
        {status === "waking" && (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span className="text-sm">
              Waking up server{retryCount > 0 ? ` (attempt ${retryCount + 1}/6)` : ""}... This may take up to 30 seconds.
            </span>
          </>
        )}
        {status === "error" && (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-sm">
              Server is taking longer than usual. Please refresh the page or try again later.
            </span>
          </>
        )}
      </div>
    </div>
  );
}
