'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, History, Sparkles } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Log Sleep',
      href: '/',
      icon: Moon,
    },
    {
      name: 'History',
      href: '/history',
      icon: History,
    },
    {
      name: 'Insights',
      href: '/insights',
      icon: Sparkles,
    },
  ];

  return (
    <>
      {/* Desktop/Tablet Header Navigation */}
      <header className="hidden sm:block border-b border-card-border glass-card sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center glow-indigo">
              <Moon className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              Sleep Clues
            </span>
          </div>
          <nav className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  id={`nav-desktop-${item.name.toLowerCase().replace(' ', '-')}`}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md glow-indigo'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Top Header */}
      <header className="sm:hidden border-b border-card-border glass-card sticky top-0 z-50">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center glow-indigo">
              <Moon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-base bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Sleep Clues
            </span>
          </div>
          <span className="text-xs text-indigo-400 font-medium px-2 py-0.5 rounded-full bg-indigo-950/50 border border-indigo-900/30">
            MVP
          </span>
        </div>
      </header>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-card-border glass-card pb-safe-bottom">
        <div className="grid grid-cols-3 h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-mobile-${item.name.toLowerCase().replace(' ', '-')}`}
                className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive ? 'bg-indigo-600/10 scale-110 text-indigo-400' : 'text-slate-400'
                  }`}
                >
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <span className="text-[10px] font-medium tracking-wide">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
