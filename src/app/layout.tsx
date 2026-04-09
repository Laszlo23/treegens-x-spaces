import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { appNetworkDescription } from "@/config/chain";
import { getPublicBaseUrl } from "@/config/site";

const fontDisplay = Syne({
  subsets: ["latin"],
  variable: "--font-display",
});

const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const base = getPublicBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: "Treegens Voice Seeds",
    template: "%s · Treegens Voice Seeds",
  },
  description: `Collectible on-chain Voice Seeds from X Spaces — ${appNetworkDescription()}, IPFS audio, Privy.`,
  icons: { icon: "/uf4apw1v_400x400.jpg" },
  openGraph: {
    type: "website",
    title: "Treegens Voice Seeds",
    description: "Futuristic forest DAO dashboard for voice NFTs on Base.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${fontDisplay.variable} ${fontSans.variable} min-h-screen bg-zinc-950 font-sans antialiased`}
      >
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
