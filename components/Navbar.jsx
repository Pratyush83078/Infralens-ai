'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Table2, BarChart3, BookOpen, AlertOctagon } from 'lucide-react';
import Mascot from './Mascot';

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: Table2 },
  { href: '/benchmarks', label: 'Benchmarks', icon: BarChart3 },
  { href: '/about', label: 'Documentation', icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bento-nav-wrapper">
      <div className="bento-nav-container">
        {/* Brand Lockup */}
        <Link href="/" className="bento-nav-brand">
          <div className="nav-mascot-badge">
            <Mascot pose="hardhat" size={34} />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              PAIMANA
              <span className="brand-tag">BENTO RADAR</span>
            </div>
            <div className="brand-subtitle">MoSPI Central Infrastructure Intelligence</div>
          </div>
        </Link>

        {/* Product Navigation Tabs (Tactile Bento Pills) */}
        <nav className="bento-nav-links" aria-label="Primary navigation">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`bento-nav-tab ${isActive ? 'active' : ''}`}
              >
                <Icon size={15} strokeWidth={2.4} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="bento-nav-right">
          <Link href="/projects?band=Critical" className="neo-btn neo-btn-primary nav-action-btn">
            <AlertOctagon size={15} strokeWidth={2.6} />
            <span>184 Flagged</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
