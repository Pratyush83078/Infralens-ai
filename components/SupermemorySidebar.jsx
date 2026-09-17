'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Sparkles, Menu, X } from 'lucide-react';

const primaryLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/projects', label: 'Projects' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/about', label: 'Docs', external: true },
];

const pageAnchors = [
  { id: 'overview', label: 'Overview' },
  { id: 'simulator', label: 'What-If Simulator' },
  { id: 'backtest', label: 'Audited Backtest' },
  { id: 'benchmarks', label: 'Dual Benchmarks' },
  { id: 'public-accuracy', label: 'Public Accuracy #1' },
  { id: 'watchlist', label: 'Critical Watchlist' },
  { id: 'deployment', label: 'Deployment Models' },
];

export default function SupermemorySidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === '/';

  return (
    <>
      {/* Mobile Bar */}
      <div className="sm-mobile-header lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white md:hidden">
        <Link href="/" className="flex items-center gap-2 text-slate-900 font-bold tracking-tight">
          <Sparkles size={16} className="text-blue-600" />
          <span>infralens</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 text-slate-600 hover:text-slate-900"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Main Sidebar */}
      <aside className={`sm-sidebar ${mobileOpen ? 'block' : 'hidden md:flex'}`}>
        <div>
          {/* Brand */}
          <Link href="/" className="sm-sidebar-brand">
            <span className="sm-brand-icon">
              <Sparkles size={18} strokeWidth={2.4} />
            </span>
            <span className="sm-brand-text">infralens</span>
          </Link>

          {/* Primary Nav */}
          <nav className="sm-sidebar-nav" aria-label="Primary navigation">
            {primaryLinks.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sm-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {isActive ? (
                    <span className="sm-nav-active-marker" aria-hidden="true" />
                  ) : (
                    <span className="sm-nav-marker-placeholder" aria-hidden="true" />
                  )}
                  <span>{item.label}</span>
                  {item.external && <span className="sm-nav-external-arrow">↗</span>}
                </Link>
              );
            })}
          </nav>

          {/* Dotted Divider */}
          <hr className="sm-dotted-divider" />

          {/* "ON THIS PAGE" Scrollspy Sub-Nav (when on Dashboard) */}
          {isHome && (
            <div className="sm-page-anchors-section">
              <div className="sm-anchors-eyebrow">On this page</div>
              {pageAnchors.map((anchor) => (
                <a
                  key={anchor.id}
                  href={`#${anchor.id}`}
                  className="sm-anchor-item"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="sm-anchor-dash">—</span>
                  <span>{anchor.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer Status */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>v2.0 · MoSPI</span>
          </div>
          <span className="text-[10px] text-slate-400">SIH 26103</span>
        </div>
      </aside>
    </>
  );
}
