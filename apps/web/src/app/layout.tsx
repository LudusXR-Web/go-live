import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { SessionProvider } from "next-auth/react";
import { type Metadata } from "next";

import { HydrateClient } from "~/trpc/server";
import { TRPCReactProvider } from "~/trpc/react";
import Footer from "~/components/composites/Footer";

export const metadata: Metadata = {
  title: "Go Live",
  description: "",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} scroll-smooth`}>
      <body className="relative h-dvh bg-primary-foreground">
        <div className="flex h-full flex-col items-center justify-between">
          <SessionProvider>
            <TRPCReactProvider>
              <HydrateClient>{children}</HydrateClient>
            </TRPCReactProvider>
          </SessionProvider>
          <Footer />
        </div>
      </body>
    </html>
  );
}
