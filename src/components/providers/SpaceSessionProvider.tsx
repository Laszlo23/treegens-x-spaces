"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { tryFetchSpaceMeta, parseSpaceIdFromUrl, type SpaceMeta } from "@/lib/spaces";

type Ctx = {
  spaceUrl: string;
  setSpaceUrl: (u: string) => void;
  meta: SpaceMeta | null;
  loading: boolean;
  error: string | null;
  loadFromUrl: (url?: string) => Promise<void>;
};

const SpaceSessionContext = createContext<Ctx | null>(null);

export function SpaceSessionProvider({ children }: { children: ReactNode }) {
  const [spaceUrl, setSpaceUrl] = useState("");
  const [meta, setMeta] = useState<SpaceMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFromUrl = useCallback(
    async (url?: string) => {
      const raw = url ?? spaceUrl;
      if (url !== undefined) setSpaceUrl(url);
      setLoading(true);
      setError(null);
      try {
        const id = parseSpaceIdFromUrl(raw);
        if (!id) {
          setMeta(null);
          setError("Could not parse a Space id from the URL.");
          return;
        }
        const m = await tryFetchSpaceMeta(id);
        setMeta(m);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load Space");
        setMeta(null);
      } finally {
        setLoading(false);
      }
    },
    [spaceUrl]
  );

  const value = useMemo(
    () => ({
      spaceUrl,
      setSpaceUrl,
      meta,
      loading,
      error,
      loadFromUrl,
    }),
    [spaceUrl, meta, loading, error, loadFromUrl]
  );

  return (
    <SpaceSessionContext.Provider value={value}>{children}</SpaceSessionContext.Provider>
  );
}

export function useSpaceSession() {
  const v = useContext(SpaceSessionContext);
  if (!v) throw new Error("useSpaceSession must be used within SpaceSessionProvider");
  return v;
}
