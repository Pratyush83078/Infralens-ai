import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Table2, BarChart3, BookOpen, AlertOctagon } from 'lucide-react';
import Mascot from './Mascot';
import './Navbar.css';

const links = [
  { to: '/',            label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/projects',    label: 'Projects',      icon: Table2 },
  { to: '/benchmarks',  label: 'Benchmarks',    icon: BarChart3 },
  { to: '/about',       label: 'Documentation', icon: BookOpen },
];

export default function Navbar() {
  return (
    <header className="bento-nav-wrapper">
      <div className="bento-nav-container">
        {/* Brand Lockup */}
        <NavLink to="/" className="bento-nav-brand">
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
        </NavLink>

        {/* Product Navigation Tabs (Tactile Bento Pills) */}
        <nav className="bento-nav-links" aria-label="Primary navigation">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `bento-nav-tab ${isActive ? 'active' : ''}`}
            >
              <Icon size={15} strokeWidth={2.4} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right Action Cluster */}
        <div className="bento-nav-right">
          <div className="nav-status-badge">
            <span className="status-live-dot" />
            <span>LIVE TELEMETRY</span>
          </div>

          <NavLink to="/projects?band=Critical" className="neo-btn neo-btn-primary nav-action-btn">
            <AlertOctagon size={15} strokeWidth={2.6} />
            <span>184 Flagged</span>
          </NavLink>
        </div>
      </div>
    </header>
  );
}
