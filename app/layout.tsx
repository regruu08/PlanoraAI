import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planora AI — Smart Celebration & Event Planner",
  description:
    "AI-powered planning assistant for weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-zinc-900 selection:bg-rose-100 selection:text-rose-900">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
