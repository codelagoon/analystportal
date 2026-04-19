import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import "./globals.css";
import { cn } from "@/lib/utils";

const plexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Echelon Terminal",
  description: "Bloomberg-inspired research workspace for student analysts.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", plexSans.variable, plexMono.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" data-authenticated={userId ? "true" : "false"}>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var key='echelon-theme';var saved=localStorage.getItem(key);var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var theme=saved==='light'||saved==='dark'?saved:(prefersDark?'dark':'light');document.documentElement.classList.toggle('dark',theme==='dark');}catch(e){document.documentElement.classList.add('dark');}})();",
          }}
        />
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
