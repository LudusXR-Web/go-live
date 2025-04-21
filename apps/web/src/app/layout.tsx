import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { SessionProvider } from "next-auth/react";
import { type Metadata } from "next";

import { HydrateClient } from "~/trpc/server";
import { TRPCReactProvider } from "~/trpc/react";
import { getLocaleFromHeaders, ioInit } from "~/lib/server-utils";
import Footer from "~/components/composites/Footer";

export const metadata: Metadata = {
  title: "Going Live",
  description: "",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!globalThis.__IO_SETUP) await ioInit();

  const locale = await getLocaleFromHeaders();

  return (
    <html lang={locale} className={`${GeistSans.variable} scroll-smooth`}>
      <body className="bg-primary-foreground relative min-h-dvh overflow-visible">
        <div className="flex min-h-dvh flex-col items-center justify-between">
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
