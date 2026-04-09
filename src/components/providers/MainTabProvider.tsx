"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type MainTabId = "profile" | "space" | "leaderboard" | "tasks";

type Ctx = {
  tab: MainTabId;
  setTab: (t: MainTabId) => void;
};

const MainTabContext = createContext<Ctx | null>(null);

export function MainTabProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<MainTabId>("space");
  const value = useMemo(() => ({ tab, setTab }), [tab]);
  return <MainTabContext.Provider value={value}>{children}</MainTabContext.Provider>;
}

export function useMainTab() {
  const v = useContext(MainTabContext);
  if (!v) throw new Error("useMainTab must be used within MainTabProvider");
  return v;
}
