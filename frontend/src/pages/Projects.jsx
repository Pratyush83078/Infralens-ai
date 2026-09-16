import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api, riskColor, cleanState, fmtCr } from '../api';
import ProjectDrawer from '../components/ProjectDrawer';
import Mascot from '../components/Mascot';
import './Projects.css';

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
  if (sortBy !== col) return <ChevronUp size={12} color="var(--stone)" />;
  return order === 'desc'
    ? <ChevronDown size={13} color="var(--ink)" strokeWidth={2.5} />
    : <ChevronUp size={13} color="var(--ink)" strokeWidth={2.5} />;
}

export default function Projects() {
  const [searchParams] = useSearchParams();
  const initialBand = searchParams.get('band') || '';

  const { data: filtersData } = useApi(api.filters);

  const [search, setSearch]     = useState('');
  const [band, setBand]         = useState(initialBand);
  const [ministry, setMinistry] = useState('');
  const [state, setState]       = useState('');
  const [driver, setDriver]     = useState('');
  const [sortBy, setSortBy]     = useState('risk_score');
  const [order, setOrder]       = useState('desc');
  const [page, setPage]         = useState(1);

  const [projects, setProjects] = useState([]);
  const [meta, setMeta]         = useState({ total_projects: 0, total_pages: 1 });
  const [loading, setLoading]   = useState(true);

  const [selected, setSelected] = useState(null);
  const [peers, setPeers]       = useState(null);

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

  const ministries = filtersData?.ministries || [];
  const states     = filtersData?.states?.filter(s => !s.includes('Page')).slice(0, 45) || [];
  const hasFilters = Boolean(search || band || ministry || state || driver);

  return (
    <div className="page-wrapper fade-in">
      {/* Page Header */}
      <div className="projects-header-strip">
        <div>
          <div className="projects-eyebrow">PORTFOLIO EXPLORER</div>
          <h1 className="projects-title">Central Sector Projects Explorer</h1>
          <p className="projects-subtitle">
            Search, filter, and inspect risk metrics across {(meta.total_projects || 2059).toLocaleString('en-IN')} monitored infrastructure projects.
          </p>
        </div>

        {hasFilters && (
          <button className="btn btn-secondary btn-sm" onClick={resetFilters}>
            <RotateCcw size={13} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar (DESIGN.md input style) */}
      <div className="filter-toolbar card">
        <div className="search-input-wrap">
          <Search size={15} className="search-input-icon" />
          <input
            className="input search-text-input"
            placeholder="Search by project name, code, or agency…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-selects-row">
          <select className="input filter-select" value={band} onChange={e => setBand(e.target.value)}>
            <option value="">All Risk Bands</option>
            {BANDS.filter(Boolean).map(b => (
              <option key={b} value={b}>{b} Band</option>
            ))}
          </select>

          <select className="input filter-select" value={ministry} onChange={e => setMinistry(e.target.value)}>
            <option value="">All Ministries</option>
            {ministries.map(m => (
              <option key={m} value={m}>
                {m.replace('Ministry of ', '').replace('Department of ', '').substring(0, 36)}
              </option>
            ))}
          </select>

          <select className="input filter-select" value={state} onChange={e => setState(e.target.value)}>
            <option value="">All States</option>
            {states.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select className="input filter-select" value={driver} onChange={e => setDriver(e.target.value)}>
            <option value="">All Risk Drivers</option>
            {DRIVERS.filter(Boolean).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Table Card */}
      <div className="card mt-4 p-0">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('project_name')} className="clickable-th">
                  <div className="th-content">
                    <span>Project Name & Agency</span>
                    <SortIcon col="project_name" sortBy={sortBy} order={order} />
                  </div>
                </th>
                <th>State & Ministry</th>
                <th onClick={() => toggleSort('risk_score')} className="clickable-th">
                  <div className="th-content">
                    <span>Risk Score</span>
                    <SortIcon col="risk_score" sortBy={sortBy} order={order} />
                  </div>
                </th>
                <th onClick={() => toggleSort('cost_overrun_ratio_so_far')} className="clickable-th">
                  <div className="th-content">
                    <span>Cost Overrun</span>
                    <SortIcon col="cost_overrun_ratio_so_far" sortBy={sortBy} order={order} />
                  </div>
                </th>
                <th onClick={() => toggleSort('doc_slip_months_so_far')} className="clickable-th">
                  <div className="th-content">
                    <span>Delay</span>
                    <SortIcon col="doc_slip_months_so_far" sortBy={sortBy} order={order} />
                  </div>
                </th>
                <th onClick={() => toggleSort('physical_progress_pct')} className="clickable-th">
                  <div className="th-content">
                    <span>Progress</span>
                    <SortIcon col="physical_progress_pct" sortBy={sortBy} order={order} />
                  </div>
                </th>
                <th>Cost↑ ML Risk</th>
                <th>Sched↑ ML Risk</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8}>
                      <div className="skeleton" style={{ height: 26 }} />
                    </td>
                  </tr>
                ))
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-projects-state">
                      <Mascot pose="magnifying" size={56} />
                      <div className="empty-title">No projects match your filter criteria</div>
                      <p className="empty-subtitle">Try adjusting your search query, ministry, or risk band filters.</p>
                      <button className="btn btn-secondary btn-sm mt-2" onClick={resetFilters}>
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map(p => (
                  <tr key={p.project_code} onClick={() => openProject(p.project_code)}>
                    <td>
                      <div className="project-row-primary">
                        <span className={`badge badge-${p.risk_band?.toLowerCase()}`}>
                          {p.risk_band}
                        </span>
                        <div>
                          <div className="proj-cell-name">{p.project_name}</div>
                          <div className="proj-cell-sub">
                            <span className="mono">#{p.project_code}</span>
                            {p.agency && <span> · {p.agency.replace(/[()]/g, '').trim().substring(0, 30)}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="proj-cell-state">{cleanState(p.state)}</div>
                      <div className="proj-cell-ministry">
                        {p.ministry?.replace('Ministry of ', '').replace('Department of ', '').substring(0, 30)}
                      </div>
                    </td>

                    <td>
                      <div className="score-cell-flex">
                        <span className="score-number mono" style={{ color: riskColor(p.risk_band) }}>
                          {p.risk_score?.toFixed(1)}
                        </span>
                        <div className="score-track-mini">
                          <div
                            style={{
                              width: `${Math.min(p.risk_score || 0, 100)}%`,
                              backgroundColor: riskColor(p.risk_band),
                              height: '100%',
                              borderRadius: '9999px',
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          color: (p.cost_overrun_ratio_so_far || 0) > 0.4 ? 'var(--risk-critical)' : 'var(--ink)',
                          fontWeight: 700,
                        }}
                      >
                        {(p.cost_overrun_ratio_so_far || 0) >= 0 ? '+' : ''}
                        {((p.cost_overrun_ratio_so_far || 0) * 100).toFixed(1)}%
                      </span>
                      <div className="cost-sub-val mono">{fmtCr(p.revised_cost_cr)}</div>
                    </td>

                    <td className="muted">
                      {p.doc_slip_months_so_far > 0 ? (
                        <span style={{ color: p.doc_slip_months_so_far > 24 ? 'var(--risk-critical)' : 'var(--body)' }}>
                          {p.doc_slip_months_so_far} mos
                        </span>
                      ) : (
                        <span style={{ color: 'var(--risk-low)', fontWeight: 600 }}>On schedule</span>
                      )}
                    </td>

                    <td>
                      <div className="prog-cell-flex">
                        <span className="mono">{(p.physical_progress_pct || 0).toFixed(1)}%</span>
                        <div className="prog-track-mini">
                          <div
                            style={{
                              width: `${Math.min(p.physical_progress_pct || 0, 100)}%`,
                              backgroundColor: riskColor(p.risk_band),
                              height: '100%',
                              borderRadius: '9999px',
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className="prob-cell-chip mono"
                        style={{
                          color: p.cost_revised_up_risk_pct >= 10 ? 'var(--risk-critical)' : p.cost_revised_up_risk_pct >= 5 ? 'var(--risk-high)' : 'var(--risk-low)',
                          backgroundColor: p.cost_revised_up_risk_pct >= 10 ? 'var(--risk-critical-bg)' : p.cost_revised_up_risk_pct >= 5 ? 'var(--risk-high-bg)' : 'var(--risk-low-bg)',
                        }}
                      >
                        {p.cost_revised_up_risk_pct?.toFixed(1)}%
                      </span>
                    </td>

                    <td>
                      <span
                        className="prob-cell-chip mono"
                        style={{
                          color: p.schedule_slipped_risk_pct >= 20 ? 'var(--risk-critical)' : p.schedule_slipped_risk_pct >= 10 ? 'var(--risk-high)' : 'var(--risk-low)',
                          backgroundColor: p.schedule_slipped_risk_pct >= 20 ? 'var(--risk-critical-bg)' : p.schedule_slipped_risk_pct >= 10 ? 'var(--risk-high-bg)' : 'var(--risk-low-bg)',
                        }}
                      >
                        {p.schedule_slipped_risk_pct?.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="pagination-bar">
          <span className="pagination-summary">
            Showing <strong>{((page - 1) * 25) + 1}–{Math.min(page * 25, meta.total_projects || 0)}</strong> of{' '}
            <strong>{(meta.total_projects || 0).toLocaleString('en-IN')}</strong> projects
          </span>

          <div className="pagination-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <span className="pagination-page-indicator">
              Page <strong>{page}</strong> of <strong>{meta.total_pages || 1}</strong>
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage(p => Math.min(meta.total_pages || 1, p + 1))}
              disabled={page >= (meta.total_pages || 1)}
            >
              <span>Next</span>
              <ChevronRight size={14} />
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
