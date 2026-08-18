import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";
import ViewedJobClickTracker from "@/components/ViewedJobClickTracker";

export const metadata: Metadata = { title: "JobFinder", description: "Search jobs across job platforms" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body><ThemeProvider><ViewedJobClickTracker />{children}</ThemeProvider></body></html>;
}
