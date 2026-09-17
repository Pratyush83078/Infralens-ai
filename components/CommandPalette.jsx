'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, ArrowRight, Layers, BarChart2, BookOpen, AlertTriangle } from 'lucide-react';

const QUICK_NAV = [
  { label: 'Dashboard & Risk Radar', href: '/', icon: Sparkles },
  { label: 'Central Projects Explorer', href: '/projects', icon: Layers },
  { label: 'Ministry Benchmarks', href: '/benchmarks', icon: BarChart2 },
  { label: 'Intelligence Documentation', href: '/about', icon: BookOpen },
];

const FEATURED_PROJECTS = [
  { project_code: '705368', project_name: 'Araria - Supaul (92 km) New Rail Line', ministry: 'Ministry of Railways', state: 'Bihar', risk_band: 'Critical', risk_score: 91.9 },
  { project_code: '5422', project_name: 'USBRL Rail Link (Kashmir Valley)', ministry: 'Ministry of Railways', state: 'Jammu and Kashmir', risk_band: 'Critical', risk_score: 89.2 },
  { project_code: '11054', project_name: 'Mumbai Trans Harbour Link (MTHL)', ministry: 'MoRTH', state: 'Maharashtra', risk_band: 'Low', risk_score: 28.5 },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const router = useRouter();

  // Listen for Cmd+K / Ctrl+K and custom trigger event
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-cmdk', handleCustomOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-cmdk', handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Query API when user types
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects?search=${encodeURIComponent(query.trim())}&page=1&limit=8`);
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json.data)
            ? json.data
            : (Array.isArray(json.projects) ? json.projects : []);
          setResults(items);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Telemetry search error:', err);
      } finally {
        setLoading(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectNav = (href) => {
    setIsOpen(false);
    router.push(href);
  };

  const handleSelectProject = (code) => {
    setIsOpen(false);
    router.push(`/projects?search=${encodeURIComponent(code)}`);
  };

  const currentList = query.trim() ? results : FEATURED_PROJECTS;

  const handleKeyDownInput = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (currentList.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + currentList.length) % (currentList.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentList[selectedIndex]) {
        handleSelectProject(currentList[selectedIndex].project_code || currentList[selectedIndex].code);
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '14vh',
        paddingLeft: 16,
        paddingRight: 16,
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 580,
          background: '#FFFFFF',
          borderRadius: 8,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          animation: 'fadeIn 0.12s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 18px',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <Search size={18} color="#0066FF" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search 2,059 projects by name, code, ministry, or state..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDownInput}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 13.5,
              fontFamily: "var(--font-geist-sans), sans-serif",
              color: '#0F172A',
              background: 'transparent',
            }}
          />
          {loading ? (
            <span style={{ fontSize: 11, color: '#0066FF', fontFamily: 'var(--font-geist-mono)' }}>
              Searching...
            </span>
          ) : (
            <kbd
              style={{
                fontSize: 10,
                fontFamily: 'var(--font-geist-mono), monospace',
                color: '#64748B',
                padding: '2px 5px',
                borderRadius: 4,
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
              }}
            >
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '8px' }}>
          <div>
            <div
              style={{
                fontSize: 10,
                fontFamily: 'var(--font-geist-mono)',
                fontWeight: 700,
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '4px 8px 6px',
              }}
            >
              {query.trim() ? 'Search Results' : 'Featured Critical Projects'}
            </div>

            {query.trim() && !loading && results.length === 0 ? (
              <div style={{ padding: '20px 12px', textAlign: 'center', fontSize: 12.5, color: '#64748B' }}>
                No projects found matching "<strong>{query}</strong>".
              </div>
            ) : (
              currentList.map((p, idx) => {
                const code = p.project_code || p.code;
                const name = p.project_name || p.name;
                const isSelected = selectedIndex === idx;

                return (
                  <div
                    key={code}
                    onClick={() => handleSelectProject(code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 5,
                      cursor: 'pointer',
                      background: isSelected ? '#F1F5F9' : 'transparent',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden', paddingRight: 10 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: '#0F172A',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {name}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', fontFamily: 'var(--font-geist-mono)' }}>
                        <span style={{ color: '#0066FF', fontWeight: 600 }}>#{code}</span> · {p.ministry} · {p.state}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {p.risk_score && (
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-geist-mono)', color: '#64748B' }}>
                          Score: <strong>{Number(p.risk_score).toFixed(1)}</strong>
                        </span>
                      )}

                      {p.risk_band && (
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: 'var(--font-geist-mono)',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 3,
                            background: p.risk_band === 'Critical' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                            color: p.risk_band === 'Critical' ? '#DC2626' : '#D97706',
                            border: `1px solid ${p.risk_band === 'Critical' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                          }}
                        >
                          {p.risk_band}
                        </span>
                      )}

                      <ArrowRight size={13} color="#94A3B8" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Page Jump Links */}
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #F1F5F9' }}>
            <div
              style={{
                fontSize: 10,
                fontFamily: 'var(--font-geist-mono)',
                fontWeight: 700,
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '4px 8px',
              }}
            >
              Navigation
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {QUICK_NAV.map((nav) => {
                const Icon = nav.icon;
                return (
                  <div
                    key={nav.href}
                    onClick={() => handleSelectNav(nav.href)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '7px 9px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                      color: '#0F172A',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Icon size={13} color="#0066FF" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {nav.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info strip */}
        <div
          style={{
            padding: '7px 14px',
            background: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 10.5,
            fontFamily: 'var(--font-geist-mono)',
            color: '#64748B',
          }}
        >
          <span>Live telemetry across 2,059 projects</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
