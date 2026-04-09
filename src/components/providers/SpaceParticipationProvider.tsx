"use client";

/**
 * Tracks “presence” in the loaded Space: visible tab time accumulates toward 15 minutes,
 * then the user may mint a Voice Seed (see Capture tab). Persisted per Space id in localStorage.
 * Resets when the user successfully mints so a new 15-minute session unlocks another mint.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PARTICIPATION_REQUIRED_MS, storageKeyForSpace, type ParticipationPersisted } from "@/lib/participation";
import { useSpaceSession } from "@/components/providers/SpaceSessionProvider";
import { useMainTab } from "@/components/providers/MainTabProvider";
import { cn } from "@/lib/cn";

type Ctx = {
  /** User clicked “Join this Space” and timer is running. */
  isParticipating: boolean;
  /** Milliseconds counted while the tab is visible (capped logic client-side). */
  activeMs: number;
  eligibleToMint: boolean;
  requiredMs: number;
  joinSession: () => void;
  leaveSession: () => void;
  /** Call after a successful mint so the next Voice Seed needs another 15 minutes. */
  resetAfterMint: () => void;
};

const ParticipationContext = createContext<Ctx | null>(null);

function loadPersisted(spaceId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(storageKeyForSpace(spaceId));
    if (!raw) return 0;
    const p = JSON.parse(raw) as ParticipationPersisted;
    return typeof p.activeMs === "number" ? Math.min(p.activeMs, PARTICIPATION_REQUIRED_MS * 2) : 0;
  } catch {
    return 0;
  }
}

function savePersisted(spaceId: string, activeMs: number) {
  if (typeof window === "undefined") return;
  const payload: ParticipationPersisted = { activeMs, savedAt: Date.now() };
  localStorage.setItem(storageKeyForSpace(spaceId), JSON.stringify(payload));
}

export function SpaceParticipationProvider({ children }: { children: ReactNode }) {
  const { meta } = useSpaceSession();
  const { setTab } = useMainTab();
  const spaceId = meta?.id ?? null;

  const [isParticipating, setIsParticipating] = useState(false);
  const [activeMs, setActiveMs] = useState(0);
  const [popupOpen, setPopupOpen] = useState(false);
  /** `undefined` until first eligible read after Space id is known — avoids popup on reload when already ≥15 min. */
  const prevEligibleRef = useRef<boolean | undefined>(undefined);
  const spaceIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!spaceId) {
      setActiveMs(0);
      setIsParticipating(false);
      spaceIdRef.current = null;
      prevEligibleRef.current = undefined;
      return;
    }
    if (spaceIdRef.current !== spaceId) {
      spaceIdRef.current = spaceId;
      setActiveMs(loadPersisted(spaceId));
      setIsParticipating(false);
      prevEligibleRef.current = undefined;
    }
  }, [spaceId]);

  useEffect(() => {
    if (!isParticipating || !spaceId) return;

    const tick = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      setActiveMs((ms) => {
        const next = Math.min(ms + 1000, PARTICIPATION_REQUIRED_MS * 2);
        savePersisted(spaceId, next);
        return next;
      });
    };

    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [isParticipating, spaceId]);

  const eligibleToMint = activeMs >= PARTICIPATION_REQUIRED_MS;

  useEffect(() => {
    const prev = prevEligibleRef.current;
    const now = eligibleToMint;
    if (prev === undefined) {
      prevEligibleRef.current = now;
      return;
    }
    if (!prev && now) {
      setPopupOpen(true);
    }
    prevEligibleRef.current = now;
  }, [eligibleToMint]);

  const joinSession = useCallback(() => {
    setIsParticipating(true);
  }, []);

  const leaveSession = useCallback(() => {
    setIsParticipating(false);
  }, []);

  const resetAfterMint = useCallback(() => {
    if (!spaceId) return;
    setActiveMs(0);
    savePersisted(spaceId, 0);
    setIsParticipating(false);
    prevEligibleRef.current = false;
  }, [spaceId]);

  const value = useMemo(
    () => ({
      isParticipating,
      activeMs,
      eligibleToMint,
      requiredMs: PARTICIPATION_REQUIRED_MS,
      joinSession,
      leaveSession,
      resetAfterMint,
    }),
    [isParticipating, activeMs, eligibleToMint, joinSession, leaveSession, resetAfterMint]
  );

  return (
    <ParticipationContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {popupOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="participation-popup-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setPopupOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="relative max-w-md rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-zinc-950 via-emerald-950/90 to-zinc-950 p-6 shadow-[0_0_80px_rgba(213,226,107,0.22)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl"
                aria-hidden
              />
              <p id="participation-popup-title" className="font-display text-xl font-semibold text-emerald-50">
                You&apos;re in — mint unlocked
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                You&apos;ve been present in this Space for 15 minutes. You can now mint a Voice Seed NFT for this
                session.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPopupOpen(false);
                    setTab("tasks");
                  }}
                  className={cn(
                    "rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white",
                    "shadow-lg shadow-emerald-900/40"
                  )}
                >
                  Mint Voice Seed
                </button>
                <button
                  type="button"
                  onClick={() => setPopupOpen(false)}
                  className="rounded-xl border border-zinc-600 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  Stay in Space
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ParticipationContext.Provider>
  );
}

export function useSpaceParticipation() {
  const v = useContext(ParticipationContext);
  if (!v) throw new Error("useSpaceParticipation must be used within SpaceParticipationProvider");
  return v;
}
