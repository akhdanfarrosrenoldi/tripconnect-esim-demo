import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TripConnect — Travel eSIM Demo",
  description: "Demo pemesanan travel eSIM untuk technical test Fullstack Developer.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
