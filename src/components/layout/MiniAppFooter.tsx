"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { IconLeaderboard, IconProfile, IconSpace, IconTasks } from "@/components/icons/nav-icons";
import { useMainTab, type MainTabId } from "@/components/providers/MainTabProvider";

const items: { id: MainTabId; label: string; Icon: typeof IconProfile }[] = [
  { id: "profile", label: "Profile", Icon: IconProfile },
  { id: "space", label: "Space", Icon: IconSpace },
  { id: "leaderboard", label: "Board", Icon: IconLeaderboard },
  { id: "tasks", label: "Tasks", Icon: IconTasks },
];

export function MiniAppFooter() {
  const { tab, setTab } = useMainTab();

  return (
    <footer
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-500/20",
        "bg-zinc-950/85 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/75",
        "pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      )}
      role="navigation"
      aria-label="App sections"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-0 px-1 pt-1">
        {items.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition-colors",
                active ? "text-emerald-300" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {active && (
                <motion.span
                  layoutId="dockGlow"
                  className="absolute inset-x-1 inset-y-0 rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/25"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative z-10">
                <Icon aria-hidden />
              </span>
              <span className="relative z-10 max-w-full truncate px-0.5 text-[10px] font-medium tracking-wide">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}
