"use client";

import { useEffect, useState } from "react";

export interface CertificateStats {
  attendance: { present: number; total: number };
  sessionsAttended: number;
  snsVerified: number;
  shellsSent: number;
  shellsReceived: number;
}

let cachedStats: Record<string, unknown>[] | null = null;
let fetchPromise: Promise<void> | null = null;

/**
 * Fetches live stats from /api/certificate/stats and returns the stats
 * for the given member name. Falls back to `fallback` on error or while loading.
 */
export function useLiveStats(
  memberName: string,
  fallback: CertificateStats
): CertificateStats {
  const [stats, setStats] = useState<CertificateStats>(fallback);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!cachedStats) {
        if (!fetchPromise) {
          fetchPromise = fetch("/api/certificate/stats")
            .then((r) => r.json())
            .then((data) => {
              if (Array.isArray(data)) cachedStats = data;
            })
            .catch(() => {});
        }
        await fetchPromise;
      }

      if (cancelled || !cachedStats) return;

      const found = cachedStats.find(
        (m) => m.name === memberName
      );

      if (found) {
        setStats({
          attendance: {
            present: (found.attendanceCount as number) ?? fallback.attendance.present,
            total: 7,
          },
          sessionsAttended: (found.sessionsAttended as number) ?? fallback.sessionsAttended,
          snsVerified: (found.snsVerified as number) ?? fallback.snsVerified,
          shellsSent: (found.shellsSent as number) ?? fallback.shellsSent,
          shellsReceived: (found.shellsReceived as number) ?? fallback.shellsReceived,
        });
      }
    }

    load();
    return () => { cancelled = true; };
  }, [memberName, fallback]);

  return stats;
}
