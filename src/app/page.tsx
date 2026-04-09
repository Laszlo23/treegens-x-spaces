import { appNetworkDescription } from "@/config/chain";
import { ForestParticles } from "@/components/effects/ForestParticles";
import { Navbar } from "@/components/layout/Navbar";
import { MainTabs } from "@/components/layout/MainTabs";
import { CommunityGuide } from "@/components/onboarding/CommunityGuide";
import { MainTabProvider } from "@/components/providers/MainTabProvider";
import { SpaceParticipationProvider } from "@/components/providers/SpaceParticipationProvider";
import { SpaceSessionProvider } from "@/components/providers/SpaceSessionProvider";

export default function Home() {
  return (
    <SpaceSessionProvider>
      <MainTabProvider>
        <SpaceParticipationProvider>
          <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
            <ForestParticles />
            <Navbar />
            <main className="relative z-10 mx-auto max-w-6xl px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-6 md:pb-[calc(5rem+env(safe-area-inset-bottom))]">
              <p className="mb-4 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
                Collectible <span className="text-emerald-400/90">Voice Seeds</span> — on-chain moments tied to
                X Spaces, with audio and metadata on IPFS, minted on {appNetworkDescription()}. Use the dock:{" "}
                <span className="text-zinc-300">Space → participate → Tasks → Profile &amp; Leaderboard</span>.
              </p>
              <CommunityGuide className="mb-6" />
              <MainTabs />
            </main>
          </div>
        </SpaceParticipationProvider>
      </MainTabProvider>
    </SpaceSessionProvider>
  );
}
