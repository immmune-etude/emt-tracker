import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "emt_tracker_data";

export function useApplications() {
  const [applications, setApplications] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setApplications(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setLoading(false);
  }, []);

  const persist = useCallback((next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* quota / private mode */
    }
  }, []);

  const updateApp = useCallback(
    (companyId, updates) => {
      setApplications((prev) => {
        const current = prev[companyId] || {};
        const merged = { ...current, ...updates };

        // Auto-stamp applied date when moving into applied/interview/offer
        if (
          updates.status &&
          ["applied", "interview", "offer"].includes(updates.status) &&
          !merged.dateApplied
        ) {
          merged.dateApplied = new Date().toISOString().slice(0, 10);
        }

        const next = { ...prev, [companyId]: merged };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(applications, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emt-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [applications]);

  const importData = useCallback(
    (file) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          if (parsed && typeof parsed === "object") {
            setApplications(parsed);
            persist(parsed);
          }
        } catch {
          alert("Could not import that file — make sure it’s a valid backup JSON.");
        }
      };
      reader.readAsText(file);
    },
    [persist]
  );

  const resetAll = useCallback(() => {
    if (!confirm("Clear all application progress? This cannot be undone.")) return;
    setApplications({});
    persist({});
  }, [persist]);

  return { applications, loading, updateApp, exportData, importData, resetAll };
}
