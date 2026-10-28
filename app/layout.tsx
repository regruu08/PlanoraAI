import type { Metadata, Viewport } from 'next';
import './globals.css';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Planora AI — Smart Celebration & Event Planner',
  description:
    'AI-powered planning assistant for weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas.',
};

export const viewport: Viewport = {
  themeColor: '#FAF8F5',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Pre-paint detection for theme, motion-lite & saveData mode to prevent flash of unstyled content */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('planora_theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark');}var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var s=navigator.connection&&navigator.connection.saveData;var c=navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4;if(r||s||c){document.documentElement.classList.add('motion-lite');}if(s){document.documentElement.classList.add('data-save-mode');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#FAF8F5] text-zinc-900 selection:bg-rose-100 selection:text-rose-900">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
        <ThemeToggle floating />
      </body>
    </html>
  );
}
