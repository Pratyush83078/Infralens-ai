// Centralised API layer — all fetch calls live here

const BASE = typeof window !== 'undefined' ? '/api' : (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api');

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  health:      ()          => get('/health'),
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
  const map = { Critical: '#cd4239', High: '#e06a14', Medium: '#c49206', Low: '#2c8c66' };
  return map[band] || '#6c6e63';
}

export function riskBgColor(band) {
  const map = { Critical: '#f7d6d3', High: '#fae4d7', Medium: '#fbf4d7', Low: '#d9eddf' };
  return map[band] || '#e5e7e0';
}

export function scoreColor(score) {
  if (score >= 75) return '#cd4239';
  if (score >= 50) return '#e06a14';
  if (score >= 25) return '#c49206';
  return '#2c8c66';
}

export function cleanState(state) {
  if (!state) return '—';
  return state.replace(/Page \d+/g, '').replace(/[()]/g, '').trim();
}
