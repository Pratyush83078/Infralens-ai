'use client';

import { useState, useEffect } from 'react';
import { Sliders, RotateCcw, AlertTriangle, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { fmtCr } from '@/lib/api';
import PrecisionSlider from '@/components/PrecisionSlider';

const LANDMARK_PRESETS = [
  {
    project_code: '705368',
    project_name: 'Araria - Supaul (92 km) New Railway Line',
    ministry: 'Ministry of Railways',
    state: 'Bihar',
    physical_progress_pct: 40.0,
    cumulative_expenditure_cr: 1658.0,
    revised_cost_cr: 2621.0,
    original_cost_cr: 1605.0,
    doc_slip_months_so_far: 34,
    risk_score: 91.9,
    risk_band: 'Critical',
  },
  {
    project_code: '5422',
    project_name: 'Udhampur-Srinagar-Baramulla Rail Link (USBRL)',
    ministry: 'Ministry of Railways',
    state: 'Jammu and Kashmir',
    physical_progress_pct: 88.0,
    cumulative_expenditure_cr: 37200.0,
    revised_cost_cr: 41000.0,
    original_cost_cr: 21653.0,
    doc_slip_months_so_far: 60,
    risk_score: 89.2,
    risk_band: 'Critical',
  },
  {
    project_code: '11054',
    project_name: 'Mumbai Trans Harbour Link (MTHL / Atal Setu)',
    ministry: 'Ministry of Road Transport & Highways',
    state: 'Maharashtra',
    physical_progress_pct: 96.0,
    cumulative_expenditure_cr: 17843.0,
    revised_cost_cr: 17843.0,
    original_cost_cr: 14720.0,
    doc_slip_months_so_far: 8,
    risk_score: 28.5,
    risk_band: 'Low',
  },
];

export default function WhatIfSimulator({ project: externalProject }) {
  // If externalProject provided, bind directly to it; otherwise allow toggling presets
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const activeProject = externalProject || LANDMARK_PRESETS[selectedPresetIndex];

  // Baseline values derived from actual project telemetry
  const baselineProgress = Number(activeProject.physical_progress_pct || 40);
  const baselineCost = Number(activeProject.revised_cost_cr || activeProject.original_cost_cr || 1000);
  const baselineSpend = Number(activeProject.cumulative_expenditure_cr || baselineCost * 0.7);
  const baselineSpendPct = Math.round((baselineSpend / baselineCost) * 100);
  const baselineDelay = Number(activeProject.doc_slip_months_so_far || 0);
  const baselineScore = Number(activeProject.risk_score || 50);

  // Sliders state initialized to project baseline
  const [progress, setProgress] = useState(baselineProgress);
  const [spendPct, setSpendPct] = useState(baselineSpendPct);
  const [delay, setDelay] = useState(baselineDelay);

  // Whenever the bound project changes, re-sync sliders to its real baseline
  useEffect(() => {
    setProgress(Number(activeProject.physical_progress_pct || 40));
    const cost = Number(activeProject.revised_cost_cr || activeProject.original_cost_cr || 1000);
    const spend = Number(activeProject.cumulative_expenditure_cr || cost * 0.7);
    setSpendPct(Math.round((spend / cost) * 100));
    setDelay(Number(activeProject.doc_slip_months_so_far || 0));
  }, [activeProject.project_code, activeProject.physical_progress_pct, activeProject.doc_slip_months_so_far]);

  // Engine 1: Deterministic Risk Formula
  // Recomputes live on every slider movement:
  // - Physical-financial gap: spend % outpacing progress %
  // - Schedule variance non-linear compounding
  const currentGap = Math.max(0, spendPct - progress);
  const baselineGap = Math.max(0, baselineSpendPct - baselineProgress);
  const gapDelta = currentGap - baselineGap;
  const delayDelta = delay - baselineDelay;

  // Composite simulated score (clamped 0 to 100)
  const simulatedScore = Math.min(
    100,
    Math.max(
      5,
      Number((baselineScore + gapDelta * 0.45 + delayDelta * 0.75).toFixed(1))
    )
  );
  const scoreDelta = Number((simulatedScore - baselineScore).toFixed(1));

  let simBand = 'Low';
  let badgeColor = '#059669';
  if (simulatedScore >= 75) {
    simBand = 'Critical';
    badgeColor = '#DC2626';
  } else if (simulatedScore >= 50) {
    simBand = 'High';
    badgeColor = '#EA580C';
  } else if (simulatedScore >= 30) {
    simBand = 'Medium';
    badgeColor = '#D97706';
  }

  const handleReset = () => {
    setProgress(baselineProgress);
    setSpendPct(baselineSpendPct);
    setDelay(baselineDelay);
  };

  return (
    <div className="sm-simulator-box">
      {/* Corner Brackets */}
      <span className="sm-corner-bracket sm-corner-tl" aria-hidden="true" />
      <span className="sm-corner-bracket sm-corner-tr" aria-hidden="true" />
      <span className="sm-corner-bracket sm-corner-bl" aria-hidden="true" />
      <span className="sm-corner-bracket sm-corner-br" aria-hidden="true" />

      {/* Header Strip with Project Context */}
      <div className="sm-card-top-strip" style={{ paddingBottom: 12, borderBottom: '1px solid var(--border-color, #E2E8F0)', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders size={15} className="text-blue-600" />
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              "WHAT-IF" SENSITIVITY SIMULATOR (ENGINE 1 RE-EVALUATION)
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-secondary, #64748B)', marginTop: 3 }}>
            Recomputes deterministic risk scores client-side instantly from project baseline telemetry.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-mono transition"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          title="Restore Project Official Baseline"
        >
          <RotateCcw size={12} />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {/* Project Selector (Only visible if not hard-bound to an external project in drawer) */}
      {!externalProject && (
        <div style={{ marginBottom: 18, background: 'var(--surface-subtle, #F8FAFC)', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--border-color, #E2E8F0)' }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-secondary, #64748B)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            SELECT PROJECT TO STRESS-TEST:
          </span>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {LANDMARK_PRESETS.map((p, idx) => (
              <button
                key={p.project_code}
                type="button"
                onClick={() => setSelectedPresetIndex(idx)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: selectedPresetIndex === idx ? 700 : 500,
                  background: selectedPresetIndex === idx ? '#FFFFFF' : 'transparent',
                  color: selectedPresetIndex === idx ? '#0066FF' : 'var(--ink, #0F172A)',
                  border: selectedPresetIndex === idx ? '1px solid #0066FF' : '1px solid var(--border-color, #CBD5E1)',
                  boxShadow: selectedPresetIndex === idx ? '0 1px 3px rgba(0,102,255,0.15)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                #{p.project_code} · {p.project_name.split('(')[0].trim().substring(0, 24)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Project Baseline Context Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,102,255,0.03)', border: '1px solid rgba(0,102,255,0.12)', borderRadius: 6, marginBottom: 18, fontSize: 12 }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0066FF' }}>
            #{activeProject.project_code}
          </span>
          <strong style={{ marginLeft: 6, color: 'var(--ink, #0F172A)' }}>
            {activeProject.project_name}
          </strong>
          <div style={{ fontSize: 11, color: 'var(--ink-secondary, #64748B)', marginTop: 2 }}>
            {activeProject.ministry} · {activeProject.state}
          </div>
        </div>

        <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-secondary, #64748B)' }}>Official Baseline Score</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink, #0F172A)' }}>
            {baselineScore.toFixed(1)} / 100
          </div>
        </div>
      </div>

      <div className="sm-sim-grid">
        {/* Sliders Controls Column */}
        <div className="sm-sim-controls">
          {/* Slider 1: Physical Progress */}
          <PrecisionSlider
            label="Simulated Physical Progress"
            value={progress}
            onChange={setProgress}
            min={5}
            max={100}
            step={1}
            unit="%"
            baseline={baselineProgress}
            quickNudge={5}
          />

          {/* Slider 2: Capital Spend */}
          <PrecisionSlider
            label="Capital Expenditure (% of Outlay)"
            value={spendPct}
            onChange={setSpendPct}
            min={10}
            max={180}
            step={1}
            unit="%"
            baseline={baselineSpendPct}
            quickNudge={10}
          />

          {/* Slider 3: Schedule Delay */}
          <PrecisionSlider
            label="Schedule Delay (Months)"
            value={delay}
            onChange={setDelay}
            min={0}
            max={120}
            step={1}
            unit=" mos"
            prefix="+"
            baseline={baselineDelay}
            quickNudge={6}
          />
        </div>

        {/* Live Recomputed Result Gauge */}
        <div className="sm-sim-result-card">
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-secondary, #64748B)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            SIMULATED RISK SCORE
          </div>

          <div className="sm-sim-score-huge" style={{ color: badgeColor }}>
            {simulatedScore.toFixed(1)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                background: `${badgeColor}15`,
                color: badgeColor,
                border: `1px solid ${badgeColor}40`,
              }}
            >
              {simBand} Band
            </span>

            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                color: scoreDelta > 0 ? '#DC2626' : scoreDelta < 0 ? '#059669' : '#64748B',
              }}
            >
              {scoreDelta > 0 ? `+${scoreDelta} Escalation` : scoreDelta < 0 ? `${scoreDelta} Recovery` : 'No Delta'}
            </span>
          </div>

          <div className="sm-sim-narrative">
            {scoreDelta > 0 ? (
              <span>
                <strong>Negative Variance Trajectory:</strong> Pushing spend to {spendPct}% while progress lags at {progress}% widens the physical-financial decoupling gap to {currentGap}%, driving a +{scoreDelta} escalation over official baseline.
              </span>
            ) : scoreDelta < 0 ? (
              <span>
                <strong>Remediation Trajectory:</strong> Accelerating physical execution to {progress}% while curbing schedule delay to {delay} months restores milestone equilibrium, reducing composite risk by {Math.abs(scoreDelta)} points.
              </span>
            ) : (
              <span>
                <strong>Baseline Equilibrium:</strong> Sliders are currently aligned with official MoSPI reported milestones. Nudge progress or delay to simulate sensitivity.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
