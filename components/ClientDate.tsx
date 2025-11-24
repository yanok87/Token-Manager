"use client";

import { useState, useEffect } from "react";
import { formatDateTime } from "@/utils/format";

type ClientDateProps = {
  timestamp?: number;
};

/**
 * Client-only date formatter to prevent hydration mismatches
 * Only renders the formatted date after the component has mounted on the client
 */
export function ClientDate({ timestamp }: ClientDateProps) {
  const [mounted, setMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    if (timestamp) {
      setFormattedDate(formatDateTime(timestamp));
    }
  }, [timestamp]);

  if (!timestamp) {
    return <span>N/A</span>;
  }

  // During SSR and initial client render, show a placeholder
  // This ensures perfect hydration match
  if (!mounted || !formattedDate) {
    return <span suppressHydrationWarning>--</span>;
  }

  // Format date on client only after component has mounted
  return <span>{formattedDate}</span>;
}
