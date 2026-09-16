import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Table2, BarChart3, Info, Zap } from 'lucide-react';
import './Navbar.css';

const links = [
  { to: '/',            label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/projects',    label: 'Projects',    icon: Table2 },
  { to: '/benchmarks',  label: 'Benchmarks',  icon: BarChart3 },
  { to: '/about',       label: 'About',       icon: Info },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon"><Zap size={18} /></div>
        <div>
          <div className="brand-title">PAIMANA AI</div>
          <div className="brand-sub">SIH 26103 · MoSPI</div>
        </div>
      </div>
      <div className="navbar-links">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </div>
      <div className="navbar-status">
        <span className="status-dot" />
        <span className="status-text">Live · July 2026</span>
      </div>
    </nav>
  );
}
