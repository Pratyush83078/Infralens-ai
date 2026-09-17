'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles, Layers, SlidersHorizontal, Check } from 'lucide-react';

const STYLES = [
  { id: 'brutalist', label: 'Neo-Brutalist', icon: '🥊', desc: 'Tactile 2px borders, hard drop shadows' },
  { id: 'bento', label: 'Bento Grid', icon: '🍱', desc: 'Apple/Linear 20px radii, ambient soft depth' },
  { id: 'minimalist', label: 'Minimalist', icon: '⚪', desc: 'Swiss razor hairlines, zero shadows' },
  { id: 'awwwards', label: 'Awwwards Luxe', icon: '🏆', desc: 'Cinematic glass, pill geometry, deep glow' },
];

export default function ThemeController() {
  const [theme, setTheme] = useState('dark');
  const [style, setStyle] = useState('brutalist');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('paimana-theme') || 'dark';
    const savedStyle = localStorage.getItem('paimana-style') || 'brutalist';
    setTheme(savedTheme);
    setStyle(savedStyle);
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-style', savedStyle);
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('paimana-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleStyleChange = (newStyle) => {
    setStyle(newStyle);
    localStorage.setItem('paimana-style', newStyle);
    document.documentElement.setAttribute('data-style', newStyle);
  };

  if (!mounted) return null;

  return (
    <aside className="theme-controller-wrap" aria-label="Theme and layout preset controller">
      {/* Floating Control Trigger */}
      <button
        type="button"
        className="theme-floating-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Customize Theme & Layout Style"
        aria-expanded={isOpen}
      >
        <SlidersHorizontal size={15} strokeWidth={2.4} />
        <span className="theme-floating-label">
          {style === 'brutalist' ? '🥊 Brutalist' : style === 'bento' ? '🍱 Bento' : style === 'minimalist' ? '⚪ Minimal' : '🏆 Awwwards'}
        </span>
        <span className="theme-mode-indicator">
          {theme === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
        </span>
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div className="theme-popover-panel">
          <div className="theme-popover-header">
            <div className="theme-popover-title">
              <Sparkles size={14} color="var(--accent-yellow)" />
              <span>Design System Engine</span>
            </div>
            <button
              type="button"
              className="theme-popover-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close panel"
            >
              ×
            </button>
          </div>

          {/* Theme Switcher (Dark vs Light) */}
          <div className="theme-section">
            <div className="theme-section-label">Color Scheme</div>
            <div className="theme-toggle-row">
              <button
                type="button"
                className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                <Moon size={14} />
                <span>Warm Obsidian</span>
                {theme === 'dark' && <Check size={13} className="theme-check-icon" />}
              </button>
              <button
                type="button"
                className={`theme-toggle-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                <Sun size={14} />
                <span>Alabaster Paper</span>
                {theme === 'light' && <Check size={13} className="theme-check-icon" />}
              </button>
            </div>
          </div>

          {/* Style Presets Switcher */}
          <div className="theme-section">
            <div className="theme-section-label">UI Layout Paradigm</div>
            <div className="theme-styles-list">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`theme-style-option ${style === s.id ? 'active' : ''}`}
                  onClick={() => handleStyleChange(s.id)}
                >
                  <span className="style-option-icon">{s.icon}</span>
                  <div className="style-option-text">
                    <div className="style-option-title">
                      {s.label}
                      {style === s.id && <span className="style-active-pill">ACTIVE</span>}
                    </div>
                    <div className="style-option-desc">{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="theme-popover-footer">
            <span>Tokens source: <code>styles/tokens.css</code></span>
          </div>
        </div>
      )}
    </aside>
  );
}
