import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "geoip",
  description:
    "Minimal, ad-free GeoIP lookup — open source, terminal-styled.",
  openGraph: {
    title: "geoip",
    description:
      "Minimal, ad-free GeoIP lookup — open source, terminal-styled.",
    url: "https://geoip.felipebatista.dev",
    siteName: "geoip",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="font-mono bg-zinc-950 text-zinc-200 min-h-screen">
        {children}
      </body>
    </html>
  );
}
