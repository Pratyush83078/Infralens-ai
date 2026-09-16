import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Table2, BarChart3, BookOpen, AlertOctagon } from 'lucide-react';
import Mascot from './Mascot';
import './Navbar.css';

const links = [
  { to: '/',            label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/projects',    label: 'Projects',    icon: Table2 },
  { to: '/benchmarks',  label: 'Benchmarks',  icon: BarChart3 },
  { to: '/about',       label: 'Documentation', icon: BookOpen },
];

export default function Navbar() {
  return (
    <header className="primary-nav">
      <div className="nav-container">
        {/* Brand Lockup */}
        <NavLink to="/" className="nav-brand">
          <Mascot pose="hardhat" size={38} className="brand-mascot" />
          <div className="brand-text">
            <div className="brand-title">PAIMANA</div>
            <div className="brand-subtitle">MoSPI Infrastructure Radar</div>
          </div>
        </NavLink>

        {/* Product Navigation Tabs */}
        <nav className="nav-links-cluster" aria-label="Primary navigation">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `product-nav-tab ${isActive ? 'active' : ''}`}
            >
              <Icon size={15} strokeWidth={2.2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right Utility Cluster */}
        <div className="nav-right-cluster">
          <div className="nav-live-chip" title="Real-time PAIMANA data ingestion">
            <span className="live-dot" />
            <span className="live-label">July 2026 Snapshot</span>
          </div>

          <NavLink to="/projects?band=Critical" className="btn btn-primary btn-pill nav-cta-pill">
            <AlertOctagon size={14} strokeWidth={2.5} />
            <span>Critical Alerts (13)</span>
          </NavLink>
        </div>
      </div>
    </header>
  );
}
