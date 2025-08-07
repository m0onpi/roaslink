import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartRedirect - Universal In-App Browser Redirect Solution",
  description: "Seamlessly redirect users from in-app browsers to native browsers. Increase conversion rates by 40% with our intelligent redirect solution.",
  keywords: "in-app browser redirect, social media redirect, native browser, conversion optimization, SaaS",
  authors: [{ name: "SmartRedirect Team" }],
  openGraph: {
    title: "SmartRedirect - Universal In-App Browser Redirect",
    description: "Seamlessly redirect users from in-app browsers to native browsers. Increase conversion rates by 40%.",
    type: "website",
    url: "https://xrepo.fyi",
    siteName: "xrep",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartRedirect - Universal In-App Browser Redirect",
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
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
} 