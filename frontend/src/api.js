// Centralised API layer — all fetch calls live here

const BASE = 'http://localhost:5001/api';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  kpis:        ()          => get('/kpis'),
  alerts:      (n = 20)    => get(`/alerts?limit=${n}`),
  filters:     ()          => get('/filters'),
  projects:    (params)    => get(`/projects?${new URLSearchParams(params)}`),
  project:     (code)      => get(`/projects/${code}`),
  peers:       (code)      => get(`/projects/${code}/peers`),
  benchmarks:  ()          => get('/benchmarks/ministries'),
};

// ── Formatting helpers ──────────────────────────────────
export function fmtCr(cr) {
  if (cr == null || isNaN(cr)) return '—';
  if (cr >= 100000) return `₹${(cr / 100000).toFixed(2)}L Cr`;
  if (cr >= 1000)   return `₹${(cr / 1000).toFixed(2)}K Cr`;
  return `₹${cr.toFixed(0)} Cr`;
}

export function fmtPct(ratio) {
  if (ratio == null || isNaN(ratio)) return '—';
  const v = (ratio * 100).toFixed(1);
  return `${v > 0 ? '+' : ''}${v}%`;
}

export function riskColor(band) {
  const map = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e' };
  return map[band] || '#6b7280';
}

export function riskBgColor(band) {
  const map = { Critical: 'rgba(239,68,68,0.12)', High: 'rgba(249,115,22,0.12)', Medium: 'rgba(234,179,8,0.12)', Low: 'rgba(34,197,94,0.12)' };
  return map[band] || 'rgba(107,114,128,0.12)';
}

export function scoreColor(score) {
  if (score >= 75) return '#ef4444';
  if (score >= 50) return '#f97316';
  if (score >= 25) return '#eab308';
  return '#22c55e';
}

export function cleanState(state) {
  if (!state) return '—';
  return state.replace(/Page \d+/g, '').replace(/[()]/g, '').trim();
}
