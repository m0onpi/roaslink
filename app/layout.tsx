import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "./components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RoasLink - Universal In-App Browser Redirect Solution",
  description: "Seamlessly redirect users from in-app browsers to native browsers. Increase conversion rates by 40% with our intelligent redirect solution.",
  keywords: "in-app browser redirect, social media redirect, native browser, conversion optimization, SaaS",
  authors: [{ name: "RoasLink Team" }],
  openGraph: {
    title: "RoasLink - Universal In-App Browser Redirect",
    description: "Seamlessly redirect users from in-app browsers to native browsers. Increase conversion rates by 40%.",
    type: "website",
    url: "https://roaslink.co.uk",
    siteName: "roaslink",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoasLink - Universal In-App Browser Redirect",
    description: "Seamlessly redirect users from in-app browsers to native browsers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
} 