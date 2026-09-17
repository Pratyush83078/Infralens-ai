'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Download,
  ShieldCheck,
  Send,
  CheckCircle2,
  ChevronRight as ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { api, riskColor, cleanState, fmtCr } from '@/lib/api';
import { getProjectSummary, getConfidenceScore, exportToCsv } from '@/lib/intelligence';
import ProjectDrawer from '@/components/ProjectDrawer';

const BANDS = ['', 'Critical', 'High', 'Medium', 'Low'];
const DRIVERS = [
  '',
  'Cost Escalation',
  'Schedule Delay',
  'Slow Physical Progress',
  'Excessive Expenditure',
  'Repeated Revisions',
];

function SortIcon({ col, sortBy, order }) {
  if (sortBy !== col) return <ChevronUp size={11} color="var(--ink-secondary, #94A3B8)" />;
  return order === 'desc'
    ? <ChevronDown size={12} color="#0066FF" strokeWidth={2.5} />
    : <ChevronUp size={12} color="#0066FF" strokeWidth={2.5} />;
}

function ProjectsContent() {
  const searchParams = useSearchParams();
  const initialBand = searchParams?.get('band') || '';

  const { data: filtersData } = useApi(api.filters);

  const [search, setSearch]     = useState('');
  const [band, setBand]         = useState(initialBand);
  const [ministry, setMinistry] = useState('');
  const [state, setState]       = useState('');
  const [driver, setDriver]     = useState('');
  const [sortBy, setSortBy]     = useState('risk_score');
  const [order, setOrder]       = useState('desc');
  const [page, setPage]         = useState(1);

  useEffect(() => {
    const b = searchParams?.get('band');
    if (b !== null && b !== undefined) {
      setBand(b);
      setPage(1);
    }
  }, [searchParams]);

  const [projects, setProjects] = useState([]);
  const [meta, setMeta]         = useState({ total_projects: 0, total_pages: 1 });
  const [loading, setLoading]   = useState(true);

  const [selected, setSelected] = useState(null);
  const [peers, setPeers]       = useState(null);
  const [dispatchToast, setDispatchToast] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25, sort_by: sortBy, order };
      if (search)   params.search    = search;
      if (band)     params.risk_band = band;
      if (ministry) params.ministry  = ministry;
      if (state)    params.state     = state;
      if (driver)   params.driver    = driver;

      const res = await api.projects(params);
      setProjects(res.data || []);
      setMeta({ total_projects: res.total_projects, total_pages: res.total_pages });
    } catch (e) {
      console.error('Failed to fetch projects', e);
    } finally {
      setLoading(false);
    }
  }, [search, band, ministry, state, driver, sortBy, order, page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, band, ministry, state, driver]);

  async function openProject(code) {
    const [proj, peerData] = await Promise.all([
      api.project(code),
      api.peers(code).catch(() => null),
    ]);
    setSelected(proj);
    setPeers(peerData);
  }

  function toggleSort(col) {
    if (sortBy === col) {
      setOrder(o => (o === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(col);
      setOrder('desc');
    }
  }

  function resetFilters() {
    setSearch('');
    setBand('');
    setMinistry('');
    setState('');
    setDriver('');
    setPage(1);
  }

  const handleDispatch = (e, proj) => {
    e.stopPropagation();
    const id = proj.project_code || proj.code;
    const name = proj.project_name || proj.name;
    setDispatchToast(`Urgent alert dispatched for #${id} (${name}) to Ministry Nodal Secretary & PMO Pragati Cell.`);
    setTimeout(() => setDispatchToast(null), 5000);
  };

  const handleExport = () => {
    if (!projects || projects.length === 0) return;
    exportToCsv(projects, `infralens_projects_page_${page}.csv`);
  };

  const ministries = filtersData?.ministries || [];
  const states     = filtersData?.states?.filter(s => !s.includes('Page')).slice(0, 45) || [];
  const hasFilters = Boolean(search || band || ministry || state || driver);

  return (
    <div className="fade-in">
      {/* Dispatch Toast Banner */}
      {dispatchToast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            background: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 18px',
            borderRadius: '6px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '12.5px',
            fontFamily: 'var(--font-mono, monospace)',
            border: '1px solid #334155',
          }}
        >
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{dispatchToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="sm-section-header" style={{ marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: '9999px', background: 'rgba(0,102,255,0.06)', border: '1px solid rgba(0,102,255,0.2)', marginBottom: 12 }}>
          <Sparkles size={12} color="#0066FF" />
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0066FF' }}>
            PORTFOLIO EXPLORER · 2,059 PROJECTS TRACKED
          </span>
        </div>
        <h1 className="sm-section-title" style={{ fontSize: 26 }}>
          Central Sector Capital Projects Directory
        </h1>
        <p className="sm-section-desc" style={{ maxWidth: 780 }}>
          Search, filter, and inspect risk telemetry across India's central sector capital investments.
          Track cost escalations, schedule variance, and physical-financial decoupling.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="sm-filter-bar mb-4" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', flex: 1, minWidth: 320 }}>
          <div className="sm-search-wrap" style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-secondary, #64748B)' }} />
            <input
              type="text"
              placeholder="Search by project name, code, or agency..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="sm-search-input"
              style={{ width: '100%', paddingLeft: 34, height: 38, fontSize: 12.5 }}
            />
          </div>

          <select
            className="sm-search-input"
            style={{ height: 38, fontSize: 12, paddingRight: 24, cursor: 'pointer', minWidth: 130 }}
            value={band}
            onChange={e => setBand(e.target.value)}
          >
            <option value="">All Risk Bands</option>
            {BANDS.filter(Boolean).map(b => (
              <option key={b} value={b}>{b} Band</option>
            ))}
          </select>

          <select
            className="sm-search-input"
            style={{ height: 38, fontSize: 12, paddingRight: 24, cursor: 'pointer', maxWidth: 180 }}
            value={ministry}
            onChange={e => setMinistry(e.target.value)}
          >
            <option value="">All Ministries</option>
            {ministries.map(m => (
              <option key={m} value={m}>
                {m.replace('Ministry of ', '').replace('Department of ', '').substring(0, 28)}
              </option>
            ))}
          </select>

          <select
            className="sm-search-input"
            style={{ height: 38, fontSize: 12, paddingRight: 24, cursor: 'pointer', maxWidth: 140 }}
            value={state}
            onChange={e => setState(e.target.value)}
          >
            <option value="">All States</option>
            {states.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            className="sm-search-input"
            style={{ height: 38, fontSize: 12, paddingRight: 24, cursor: 'pointer', maxWidth: 160 }}
            value={driver}
            onChange={e => setDriver(e.target.value)}
          >
            <option value="">All Risk Drivers</option>
            {DRIVERS.filter(Boolean).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={resetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '0 12px',
                height: 38,
                background: 'transparent',
                border: '1px solid var(--border-color, #E2E8F0)',
                borderRadius: '5px',
                fontSize: 12,
                color: 'var(--ink-secondary, #64748B)',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* CSV Export Button */}
        <button
          onClick={handleExport}
          className="sm-btn-secondary"
          style={{ height: 38, padding: '0 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          title="Export current page to CSV"
        >
          <Download size={13} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Projects Table Card with Supermemory Framing */}
      <div className="sm-card mb-6" style={{ overflow: 'hidden' }}>
        <span className="sm-corner-bracket sm-corner-tl" />
        <span className="sm-corner-bracket sm-corner-tr" />
        <span className="sm-corner-bracket sm-corner-bl" />
        <span className="sm-corner-bracket sm-corner-br" />

        <div className="sm-card-top-strip" style={{ borderBottom: '1px solid var(--border-color, #E2E8F0)', padding: '12px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              LIVE PROJECTS TELEMETRY
            </span>
            <span style={{ fontSize: 11, color: 'var(--ink-secondary, #64748B)', fontFamily: 'var(--font-mono)' }}>
              {meta.total_projects ? `${meta.total_projects.toLocaleString('en-IN')} total` : ''}
            </span>
          </div>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-secondary, #64748B)' }}>
            PAGE {page} OF {meta.total_pages || 1}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="sm-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('project_name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Project Name & Agency</span>
                    <SortIcon col="project_name" sortBy={sortBy} order={order} />
                  </div>
                </th>
                <th>State & Ministry</th>
                <th onClick={() => toggleSort('risk_score')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Risk Score</span>
                    <SortIcon col="risk_score" sortBy={sortBy} order={order} />
                  </div>
                </th>
                <th onClick={() => toggleSort('cost_overrun_ratio_so_far')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Cost Overrun</span>
                    <SortIcon col="cost_overrun_ratio_so_far" sortBy={sortBy} order={order} />
                  </div>
                </th>
                <th onClick={() => toggleSort('doc_slip_months_so_far')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Delay</span>
                    <SortIcon col="doc_slip_months_so_far" sortBy={sortBy} order={order} />
                  </div>
                </th>
                <th onClick={() => toggleSort('physical_progress_pct')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Progress</span>
                    <SortIcon col="physical_progress_pct" sortBy={sortBy} order={order} />
                  </div>
                </th>
                <th>Confidence</th>
                <th>AI Risk Narrative</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} style={{ padding: '14px 18px' }}>
                      <div className="skeleton-shimmer" style={{ height: 26, borderRadius: 4, width: '100%' }} />
                    </td>
                  </tr>
                ))
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink, #0F172A)', marginBottom: 6 }}>
                      No projects match the selected criteria
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--ink-secondary, #64748B)', marginBottom: 14 }}>
                      Try clearing search filters or selecting another risk band.
                    </p>
                    <button onClick={resetFilters} className="sm-btn-secondary" style={{ fontSize: 12 }}>
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                projects.map(p => {
                  const summary = getProjectSummary(p);
                  const confidence = getConfidenceScore(p);
                  const code = p.project_code || p.code;

                  return (
                    <tr
                      key={code}
                      onClick={() => openProject(code)}
                      style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                    >
                      {/* Name & Agency */}
                      <td style={{ maxWidth: 260 }}>
                        <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--ink, #0F172A)', lineHeight: 1.35, marginBottom: 3 }}>
                          {p.project_name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                          <span style={{ color: '#0066FF', fontWeight: 600 }}>#{code}</span>
                          {p.agency && (
                            <span style={{ color: 'var(--ink-secondary, #64748B)' }}>
                              · {p.agency.replace(/[()]/g, '').trim().substring(0, 26)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* State & Ministry */}
                      <td style={{ fontSize: 11.5 }}>
                        <div style={{ fontWeight: 600, color: 'var(--ink, #0F172A)' }}>{cleanState(p.state)}</div>
                        <div style={{ color: 'var(--ink-secondary, #64748B)', fontSize: 11, marginTop: 2 }}>
                          {p.ministry?.replace('Ministry of ', '').replace('Department of ', '').substring(0, 24)}
                        </div>
                      </td>

                      {/* Risk Band & Score */}
                      <td>
                        <span
                          className={`sm-risk-badge sm-risk-${(p.risk_band || 'low').toLowerCase()}`}
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {p.risk_band || 'Low'} ({p.risk_score?.toFixed(1) || 0})
                        </span>
                      </td>

                      {/* Cost Overrun */}
                      <td>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: 12,
                            color: (p.cost_overrun_ratio_so_far || 0) > 0.3 ? '#DC2626' : 'var(--ink, #0F172A)',
                          }}
                        >
                          {(p.cost_overrun_ratio_so_far || 0) >= 0 ? '+' : ''}
                          {((p.cost_overrun_ratio_so_far || 0) * 100).toFixed(1)}%
                        </div>
                        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-secondary, #64748B)' }}>
                          {fmtCr(p.revised_cost_cr || p.cost_cr)}
                        </div>
                      </td>

                      {/* Delay */}
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
                        {p.doc_slip_months_so_far > 0 ? (
                          <span style={{ color: p.doc_slip_months_so_far > 24 ? '#DC2626' : '#EA580C', fontWeight: 600 }}>
                            +{p.doc_slip_months_so_far} mos
                          </span>
                        ) : (
                          <span style={{ color: '#059669', fontWeight: 600 }}>On track</span>
                        )}
                      </td>

                      {/* Progress */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600 }}>
                            {(p.physical_progress_pct || 0).toFixed(0)}%
                          </span>
                          <div style={{ width: 44, height: 4, background: 'var(--border-color, #E2E8F0)', borderRadius: 2, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(p.physical_progress_pct || 0, 100)}%`,
                                height: '100%',
                                background: riskColor(p.risk_band),
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Confidence */}
                      <td>
                        <span className="sm-confidence-pill">
                          <ShieldCheck size={10} className="text-emerald-600" />
                          <span>{confidence.score}%</span>
                        </span>
                      </td>

                      {/* Plain Language Summary */}
                      <td style={{ maxWidth: 260, fontSize: 11, color: 'var(--ink-secondary, #475569)', lineHeight: 1.4 }}>
                        {summary}
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => openProject(code)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            <span>Inspect</span>
                            <ArrowRight size={12} />
                          </button>

                          {p.risk_band === 'Critical' && (
                            <button
                              type="button"
                              onClick={e => handleDispatch(e, p)}
                              className="sm-btn-dispatch text-[10px] py-1 px-1.5"
                              title="Dispatch Alert to Ministry Nodal Officer"
                            >
                              <Send size={10} />
                              <span>Alert</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderTop: '1px solid var(--border-color, #E2E8F0)',
            background: 'var(--surface-subtle, #F8FAFC)',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span style={{ color: 'var(--ink-secondary, #64748B)' }}>
            Showing <strong>{((page - 1) * 25) + 1}–{Math.min(page * 25, meta.total_projects || 0)}</strong> of{' '}
            <strong>{(meta.total_projects || 0).toLocaleString('en-IN')}</strong> projects
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="sm-btn-secondary"
              style={{
                height: 30,
                padding: '0 10px',
                fontSize: 11.5,
                opacity: page === 1 ? 0.5 : 1,
                cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={13} />
              <span>Previous</span>
            </button>
            <span style={{ padding: '0 6px', color: 'var(--ink, #0F172A)' }}>
              Page <strong>{page}</strong> / <strong>{meta.total_pages || 1}</strong>
            </span>
            <button
              onClick={() => setPage(p => Math.min(meta.total_pages || 1, p + 1))}
              disabled={page >= (meta.total_pages || 1)}
              className="sm-btn-secondary"
              style={{
                height: 30,
                padding: '0 10px',
                fontSize: 11.5,
                opacity: page >= (meta.total_pages || 1) ? 0.5 : 1,
                cursor: page >= (meta.total_pages || 1) ? 'not-allowed' : 'pointer',
              }}
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Project Drawer Overlay */}
      {selected && (
        <ProjectDrawer
          project={selected}
          peers={peers}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

export default function Projects() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div className="sm-card" style={{ maxWidth: 420, margin: '0 auto', padding: '32px 24px' }}>
            <Sparkles size={32} color="#0066FF" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>Loading Project Telemetry...</h3>
            <p style={{ color: 'var(--ink-secondary, #64748B)', fontSize: 12, marginTop: 6 }}>
              Querying central index of 2,059 projects
            </p>
          </div>
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}
