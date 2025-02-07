import type { Metadata } from "next";
import { Plus_Jakarta_Sans as FontSans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";
import { site } from "@/config/site";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MouseFollower from "./components/ui/MouseFollower";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  ...site,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="">
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontDisplay.variable,
        )}
      >
        <MouseFollower />
        {children}
        <Toaster
          toastOptions={{
            style: {
              maxWidth: "auto",
            },
          }}
        />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
