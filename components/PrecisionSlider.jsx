'use client';

import { useMemo } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';

export default function PrecisionSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  prefix = '',
  baseline = null,
  quickNudge = 5,
}) {
  const numValue = Number(value);
  const clampedValue = Math.min(max, Math.max(min, numValue));

  // Dynamic percentage fill for the track
  const fillPct = useMemo(() => {
    if (max <= min) return 0;
    const pct = ((clampedValue - min) / (max - min)) * 100;
    return Math.min(100, Math.max(0, pct));
  }, [clampedValue, min, max]);

  const diffFromBaseline = baseline !== null ? clampedValue - baseline : null;

  const handleDecrement = () => {
    const next = Math.max(min, clampedValue - (quickNudge || step));
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, clampedValue + (quickNudge || step));
    onChange(next);
  };

  const handleReset = () => {
    if (baseline !== null) {
      onChange(baseline);
    }
  };

  return (
    <div className="precision-slider-container" style={{ marginBottom: 16 }}>
      {/* 1. Header Label & Active Value Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <label
          style={{
            fontSize: '12.5px',
            fontWeight: 600,
            color: 'var(--ink, #0F172A)',
            fontFamily: "var(--font-body, 'Geist', sans-serif)",
            letterSpacing: '-0.01em',
          }}
        >
          {label}
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Main Value Pill */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: '12px',
              fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
              fontWeight: 700,
              background: '#FFFFFF',
              color: '#0066FF',
              border: '1px solid rgba(0, 102, 255, 0.35)',
              boxShadow: '0 1px 2px rgba(0, 102, 255, 0.08)',
            }}
          >
            {prefix}{clampedValue}{unit}
          </span>

          {/* Baseline Delta Badge */}
          {baseline !== null && diffFromBaseline !== 0 && (
            <span
              style={{
                fontSize: '11px',
                fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
                fontWeight: 600,
                padding: '1px 5px',
                borderRadius: 3,
                background: diffFromBaseline > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: diffFromBaseline > 0 ? '#DC2626' : '#059669',
                border: `1px solid ${diffFromBaseline > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
              }}
              title={`Shift from official baseline of ${baseline}${unit}`}
            >
              {diffFromBaseline > 0 ? `+${diffFromBaseline}` : diffFromBaseline}{unit}
            </span>
          )}

          {baseline !== null && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--ink-muted, #94A3B8)',
                fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
              }}
            >
              (Base: {baseline}{unit})
            </span>
          )}
        </div>
      </div>

      {/* 2. Controls Row: [-] [== Track ==] [+] */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={clampedValue <= min}
          aria-label={`Decrease by ${quickNudge || step}`}
          title={`Decrease by ${quickNudge || step}${unit}`}
          style={{
            width: 24,
            height: 24,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            border: '1px solid var(--border-color, #CBD5E1)',
            background: 'var(--card-bg, #FFFFFF)',
            color: clampedValue <= min ? '#CBD5E1' : '#475569',
            cursor: clampedValue <= min ? 'not-allowed' : 'pointer',
            padding: 0,
            flexShrink: 0,
            transition: 'all 0.12s ease',
          }}
        >
          <Minus size={12} strokeWidth={2.4} />
        </button>

        {/* Dynamic Range Track */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={clampedValue}
            onChange={(e) => onChange(Number(e.target.value))}
            className="sm-range-slider"
            style={{
              background: `linear-gradient(to right, #0066FF 0%, #0066FF ${fillPct}%, #E2E8F0 ${fillPct}%, #E2E8F0 100%)`,
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={clampedValue >= max}
          aria-label={`Increase by ${quickNudge || step}`}
          title={`Increase by ${quickNudge || step}${unit}`}
          style={{
            width: 24,
            height: 24,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            border: '1px solid var(--border-color, #CBD5E1)',
            background: 'var(--card-bg, #FFFFFF)',
            color: clampedValue >= max ? '#CBD5E1' : '#475569',
            cursor: clampedValue >= max ? 'not-allowed' : 'pointer',
            padding: 0,
            flexShrink: 0,
            transition: 'all 0.12s ease',
          }}
        >
          <Plus size={12} strokeWidth={2.4} />
        </button>
      </div>

      {/* 3. Scale Legend & Reset Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 5,
          fontSize: '10.5px',
          fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
          color: 'var(--ink-muted, #94A3B8)',
        }}
      >
        <span>{prefix}{min}{unit}</span>

        {baseline !== null && clampedValue !== baseline && (
          <button
            type="button"
            onClick={handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: '10.5px',
              color: '#0066FF',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '1px 4px',
              fontFamily: 'inherit',
            }}
            title="Snap back to project official baseline"
          >
            <RotateCcw size={10} />
            <span>Reset to baseline</span>
          </button>
        )}

        <span>{prefix}{max}{unit}</span>
      </div>
    </div>
  );
}
