import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api, riskColor, cleanState, fmtCr } from '../api';
import ProjectDrawer from '../components/ProjectDrawer';
import './Projects.css';

const BANDS   = ['', 'Critical', 'High', 'Medium', 'Low'];
const DRIVERS = ['', 'Cost Escalation', 'Schedule Delay', 'Slow Physical Progress', 'Excessive Expenditure', 'Repeated Revisions'];

function SortIcon({ col, sortBy, order }) {
  if (sortBy !== col) return <ChevronUp size={11} color="#374151" />;
  return order === 'desc' ? <ChevronDown size={11} color="#818cf8" /> : <ChevronUp size={11} color="#818cf8" />;
}

export default function Projects() {
  const { data: filtersData } = useApi(api.filters);

  const [search, setSearch]   = useState('');
  const [band, setBand]       = useState('');
  const [ministry, setMinistry] = useState('');
  const [state, setState]     = useState('');
  const [driver, setDriver]   = useState('');
  const [sortBy, setSortBy]   = useState('risk_score');
  const [order, setOrder]     = useState('desc');
  const [page, setPage]       = useState(1);

  const [projects, setProjects] = useState([]);
  const [meta, setMeta]         = useState({ total_projects: 0, total_pages: 1 });
  const [loading, setLoading]   = useState(true);

  const [selected, setSelected] = useState(null);
  const [peers, setPeers]       = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25, sort_by: sortBy, order };
      if (search)   params.search   = search;
      if (band)     params.risk_band = band;
      if (ministry) params.ministry  = ministry;
      if (state)    params.state     = state;
      if (driver)   params.driver    = driver;
      const res = await api.projects(params);
      setProjects(res.data || []);
      setMeta({ total_projects: res.total_projects, total_pages: res.total_pages });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, band, ministry, state, driver, sortBy, order, page]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, band, ministry, state, driver]);

  async function openProject(code) {
    const [proj, peerData] = await Promise.all([api.project(code), api.peers(code).catch(() => null)]);
    setSelected(proj);
    setPeers(peerData);
  }

  function toggleSort(col) {
    if (sortBy === col) setOrder(o => o === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setOrder('desc'); }
  }

  const ministries = filtersData?.ministries || [];
  const states     = filtersData?.states?.filter(s => !s.includes('Page')).slice(0, 40) || [];

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <div>
          <h1>Project Explorer</h1>
          <p className="page-subtitle">{(meta.total_projects || 0).toLocaleString('en-IN')} projects · click any row for full details</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input className="input search-input" placeholder="Search by name, code or agency…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input filter-select" value={band} onChange={e => setBand(e.target.value)}>
          <option value="">All Risk Bands</option>
          {BANDS.filter(Boolean).map(b => <option key={b}>{b}</option>)}
        </select>
        <select className="input filter-select" value={ministry} onChange={e => setMinistry(e.target.value)}>
          <option value="">All Ministries</option>
          {ministries.map(m => <option key={m} value={m}>{m.replace('Ministry of ','MoF ').replace('Department of ','Dept ').substring(0,38)}</option>)}
        </select>
        <select className="input filter-select" value={state} onChange={e => setState(e.target.value)}>
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input filter-select" value={driver} onChange={e => setDriver(e.target.value)}>
          <option value="">All Drivers</option>
          {DRIVERS.filter(Boolean).map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card mt-4">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('project_name')}>
                  Project <SortIcon col="project_name" sortBy={sortBy} order={order}/>
                </th>
                <th>State / Ministry</th>
                <th onClick={() => toggleSort('risk_score')} className="sort-col">
                  Risk Score <SortIcon col="risk_score" sortBy={sortBy} order={order}/>
                </th>
                <th onClick={() => toggleSort('cost_overrun_ratio_so_far')}>
                  Overrun <SortIcon col="cost_overrun_ratio_so_far" sortBy={sortBy} order={order}/>
                </th>
                <th onClick={() => toggleSort('doc_slip_months_so_far')}>
                  Delay <SortIcon col="doc_slip_months_so_far" sortBy={sortBy} order={order}/>
                </th>
                <th onClick={() => toggleSort('physical_progress_pct')}>
                  Progress <SortIcon col="physical_progress_pct" sortBy={sortBy} order={order}/>
                </th>
                <th>Cost↑ Prob</th>
                <th>Sched↑ Prob</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(10)].map((_, i) => (
                    <tr key={i}><td colSpan={8}><div className="skeleton" style={{ height: 18 }}/></td></tr>
                  ))
                : projects.map(p => (
                    <tr key={p.project_code} onClick={() => openProject(p.project_code)}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`badge badge-${p.risk_band?.toLowerCase()}`}>{p.risk_band}</span>
                          <div>
                            <div className="proj-name">{p.project_name}</div>
                            <div className="proj-code">#{p.project_code} · {p.agency?.replace(/[()]/g,'').trim().substring(0,28)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="proj-state">{cleanState(p.state)}</div>
                        <div className="proj-ministry">{p.ministry?.replace('Ministry of ','').replace('Department of ','').substring(0,28)}</div>
                      </td>
                      <td>
                        <div className="score-cell">
                          <span className="score-big" style={{ color: riskColor(p.risk_band) }}>
                            {p.risk_score?.toFixed(1)}
                          </span>
                          <div className="score-bar-mini">
                            <div style={{ width: `${p.risk_score}%`, background: riskColor(p.risk_band), height: '100%', borderRadius: 99 }}/>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: (p.cost_overrun_ratio_so_far || 0) > 0.5 ? '#ef4444' : (p.cost_overrun_ratio_so_far || 0) > 0 ? '#f97316' : '#22c55e', fontWeight: 600 }}>
                          {(p.cost_overrun_ratio_so_far || 0) >= 0 ? '+' : ''}{((p.cost_overrun_ratio_so_far || 0) * 100).toFixed(1)}%
                        </span>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {fmtCr(p.revised_cost_cr)}
                        </div>
                      </td>
                      <td className="muted">
                        {p.doc_slip_months_so_far > 0 ? (
                          <span style={{ color: p.doc_slip_months_so_far > 36 ? '#ef4444' : 'var(--text-dim)' }}>
                            {p.doc_slip_months_so_far}m
                          </span>
                        ) : <span style={{ color: '#22c55e' }}>On time</span>}
                      </td>
                      <td>
                        <div className="prog-cell">
                          <span>{(p.physical_progress_pct || 0).toFixed(1)}%</span>
                          <div className="prog-bar-mini">
                            <div style={{ width: `${p.physical_progress_pct || 0}%`, background: riskColor(p.risk_band), height: '100%', borderRadius: 99 }}/>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: p.cost_revised_up_risk_pct >= 10 ? '#ef4444' : p.cost_revised_up_risk_pct >= 5 ? '#f97316' : '#22c55e', fontWeight: 600 }}>
                          {p.cost_revised_up_risk_pct?.toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <span style={{ color: p.schedule_slipped_risk_pct >= 20 ? '#ef4444' : p.schedule_slipped_risk_pct >= 10 ? '#f97316' : '#22c55e', fontWeight: 600 }}>
                          {p.schedule_slipped_risk_pct?.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span className="pag-info">
            Showing {((page - 1) * 25) + 1}–{Math.min(page * 25, meta.total_projects || 0)} of {(meta.total_projects || 0).toLocaleString('en-IN')}
          </span>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={14}/> Prev
            </button>
            <span className="pag-page">Page {page} / {meta.total_pages}</span>
            <button className="btn btn-ghost" onClick={() => setPage(p => Math.min(meta.total_pages, p + 1))} disabled={page >= meta.total_pages}>
              Next <ChevronRight size={14}/>
            </button>
          </div>
        </div>
      </div>

      {selected && <ProjectDrawer project={selected} peers={peers} onClose={() => setSelected(null)} />}
    </div>
  );
}
