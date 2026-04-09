"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CaptureTab } from "@/components/capture/CaptureTab";
import { MiniAppFooter } from "@/components/layout/MiniAppFooter";
import { LeaderboardTab } from "@/components/leaderboard/LeaderboardTab";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { LiveSpaceTab } from "@/components/spaces/LiveSpaceTab";
import { useMainTab } from "@/components/providers/MainTabProvider";

export function MainTabs() {
  const { tab } = useMainTab();

  return (
    <div className="space-y-6 pb-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="min-h-[min(70vh,520px)]"
        >
          {tab === "profile" && <ProfileTab />}
          {tab === "space" && <LiveSpaceTab />}
          {tab === "leaderboard" && <LeaderboardTab />}
          {tab === "tasks" && <CaptureTab />}
        </motion.div>
      </AnimatePresence>

      <MiniAppFooter />
    </div>
  );
}
