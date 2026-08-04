import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Marketing Agent',
  description: 'Automated content creation, inbox management, and analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-800 flex min-h-screen">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
          <div className="space-y-8">
            {/* App Brand */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <span>🤖</span>
                <span>Marketing AI</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Autonomous Growth Suite</p>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              <Link
                href="/"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <span>📊</span>
                <span>Dashboard</span>
              </Link>

              <Link
                href="/content"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <span>✨</span>
                <span>Content Creator</span>
              </Link>

              <Link
                href="/scheduler"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <span>📅</span>
                <span>Scheduler</span>
              </Link>

              <Link
                href="/inbox"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <span>📥</span>
                <span>Lead Inbox</span>
              </Link>

              <Link
                href="/analytics"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <span>📈</span>
                <span>Analytics</span>
              </Link>
            </nav>
          </div>

          {/* System Status Footer */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-600">Supabase Connected</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}