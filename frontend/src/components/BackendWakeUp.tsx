"use client";

import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Silent component that pings the backend on mount to wake it up.
 * Render's free tier spins down after ~15 min of inactivity,
 * causing 30-60s cold starts. This pre-emptive ping starts the
 * wake-up process as soon as the user loads the page.
 */
export default function BackendWakeUp() {
  useEffect(() => {
    // Fire and forget - we don't need to wait for the response
    fetch(`${API_URL}/health`, { method: "GET" }).catch(() => {
      // Silently ignore errors - this is just a wake-up call
    });
  }, []);

  return null; // Renders nothing
}
