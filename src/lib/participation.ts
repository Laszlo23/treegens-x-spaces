/** Required listening time (tab visible) before a participation Voice Seed mint unlocks. */
export const PARTICIPATION_REQUIRED_MS = 15 * 60 * 1000;

export function storageKeyForSpace(spaceId: string): string {
  return `treegens_participation_${spaceId}`;
}

export type ParticipationPersisted = {
  activeMs: number;
  /** Wall clock when we last saved (for debugging). */
  savedAt: number;
};

/** Formats milliseconds as M:SS (for progress display). */
export function formatParticipationClock(activeMs: number): string {
  const totalSec = Math.floor(activeMs / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
