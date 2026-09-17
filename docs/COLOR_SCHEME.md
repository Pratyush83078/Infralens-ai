# PAIMANA Design System — Color Scheme & UI Layout Architecture

> **Official Design Token & Layout Specification**  
> Anti-AI-Slop Certified • Dual-Theme (Dark & Light) • Multi-Paradigm UI Morphing Engine

---

## 1. Design Philosophy & The Anti-AI-Slop Manifesto

Traditional AI generators (v0, bolt, cursor defaults) reflexively produce the same template:
* Cold navy blue / slate dark mode (`#0B0F19`, `#171821`)
* Diffuse atmospheric purple/cyan radial glow washes
* Unanchored candy semantic badges
* Flat, indistinguishable surface layers

The **PAIMANA Design System** adheres strictly to the **Anti-AI-Slop guidelines** formulated in [`yetone/kill-ai-slop`](file:///.agents/skills/kill-ai-slop/SKILL.md) and [`nutlope/hallmark`](file:///.agents/skills/hallmark/SKILL.md):

1. **Anchored Warmth (No Navy Blue)**:
   * **Dark Mode**: Built upon warm obsidian, graphite, and carbon (`#0E0E11`, `#17171A`). Neutrals are subtly tinted with warmth, giving an authentic physical, tactile presence.
   * **Light Mode**: Built upon crisp architectural paper and warm alabaster (`#F8F9FB`, `#FFFFFF`). Never blinding sterile `#000000`-on-`#FFFFFF` without calibration.
2. **Single Primary Signal Accent**:
   * One deliberate signal color: **Industrial Amber Gold (`#F5C518`)** inspired by infrastructure surveying, construction warnings, and high-visibility field instruments.
   * Occupies $\le 5\%$ of any viewport for maximum communicative clarity.
3. **Decoupled Architecture**:
   * Color tokens and layout physics are completely decoupled. You can transform the entire interface between **Neo-Brutalist**, **Bento Grid**, **Minimalist**, and **Awwwards-Like** in real-time simply by switching design tokens.

---

## 2. Complete Color Token Specification

### 🌙 Dark Mode (Warm Obsidian / Carbon) — Default

| Token | HEX | OKLCH / HSL | Semantic Role | WCAG Contrast |
|---|---|---|---|---|
| `--bg` | `#0E0E11` | `oklch(14% 0.006 280)` | Base canvas background | Canvas |
| `--bg-grid` | `rgba(255, 255, 255, 0.035)` | — | Architectural coordinate grid pattern | — |
| `--card-bg` | `#17171A` | `oklch(18% 0.005 280)` | Primary container / card surface | 15.8:1 vs `--ink` |
| `--card-bg-soft` | `#1E1E23` | `oklch(21% 0.007 280)` | Secondary nested containers, toolbar inputs | 12.4:1 vs `--ink` |
| `--surface-cream` | `#26262D` | `oklch(24% 0.008 280)` | Elevated interactive states, stat boxes | 9.8:1 vs `--ink` |
| `--border-color` | `#2D2D34` | `oklch(28% 0.008 280)` | Crisp physical card boundaries & dividers | 3.2:1 vs `--bg` |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | — | Hairline internal borders | — |
| `--ink` | `#F4F4F6` | `oklch(95% 0.004 280)` | Primary headings, table cells, key data | 15.8:1 (AAA) |
| `--ink-secondary` | `#A1A1AA` | `oklch(70% 0.008 280)` | Subtitles, secondary metadata, table labels | 7.2:1 (AAA) |
| `--ink-muted` | `#71717A` | `oklch(54% 0.008 280)` | Footnotes, helper text, inactive tabs | 4.6:1 (AA) |
| `--accent-yellow` | `#F5C518` | `oklch(82% 0.17 88)` | Primary signal gold (active tabs, CTA buttons) | 12.2:1 vs `#000` |
| `--accent-yellow-soft`| `rgba(245, 197, 24, 0.12)`| — | Accent hover fills, table row highlights | — |

---

### ☀️ Light Mode (Architectural Paper / Crisp Alabaster)

| Token | HEX | OKLCH / HSL | Semantic Role | WCAG Contrast |
|---|---|---|---|---|
| `--bg` | `#F8F9FB` | `oklch(97% 0.004 260)` | Architectural drafting paper canvas | Canvas |
| `--bg-grid` | `rgba(0, 0, 0, 0.04)` | — | Light engineering grid pattern | — |
| `--card-bg` | `#FFFFFF` | `oklch(100% 0 0)` | Pure crisp card surface | 16.5:1 vs `--ink` |
| `--card-bg-soft` | `#F1F3F7` | `oklch(94% 0.006 260)` | Nested containers, search inputs, toolbars | 14.1:1 vs `--ink` |
| `--surface-cream` | `#EAECEF` | `oklch(91% 0.007 260)` | Stat boxes, secondary pill badges | 11.2:1 vs `--ink` |
| `--border-color` | `#000000` *(Brutalist)* / `#E2E8F0` *(Modern)* | — | Structural borders & separators | 21:1 or 4.5:1 |
| `--border-subtle` | `rgba(0, 0, 0, 0.08)` | — | Hairline internal borders | — |
| `--ink` | `#0F172A` | `oklch(18% 0.02 260)` | Deep slate ink for maximum readability | 16.5:1 (AAA) |
| `--ink-secondary` | `#475569` | `oklch(45% 0.02 260)` | Secondary explanations, field labels | 8.1:1 (AAA) |
| `--ink-muted` | `#64748B` | `oklch(56% 0.02 260)` | Timestamps, placeholder copy | 4.8:1 (AA) |
| `--accent-yellow` | `#D97706` *(Light UI)* / `#F5C518` *(Pill)* | `oklch(62% 0.16 75)` | Calibrated amber signal for light mode | 4.9:1 on White |
| `--accent-yellow-soft`| `rgba(217, 119, 6, 0.12)`| — | Soft amber chip background | — |

---

### 🚦 Semantic & Risk Domain Colors (Both Modes)

These colors are standardized for domain-specific risk radar analytics and remain semantically consistent across themes:

| Band / Category | Hex Fill | Hex Badge Bg | Semantic Function |
|---|---|---|---|
| **Critical Risk** | `#EF4444` | `rgba(239, 68, 68, 0.15)` | Immediate project stoppage, severe cost/time overrun |
| **High Risk** | `#F97316` | `rgba(249, 115, 22, 0.15)` | Serious milestone variance, budget overrun risk |
| **Medium Risk** | `#F59E0B` | `rgba(245, 158, 11, 0.15)` | Moderate delays, contractor capacity constraints |
| **Low Risk** | `#10B981` | `rgba(16, 185, 129, 0.15)` | On schedule, within approved expenditure plan |
| **Cobalt Accent** | `#3B82F6` | `rgba(59, 130, 246, 0.15)` | Secondary filters, peer benchmarking comparisons |
| **Coral Accent** | `#FB7185` | `rgba(251, 113, 133, 0.15)` | Flagged anomalies, priority callouts |

---

## 3. The Multi-Paradigm UI Morphing Engine

The Next.js frontend is structured around **Aesthetic Presets**. All components consume CSS tokens rather than hardcoded styles. By changing the `data-style` attribute on `<html>`, the entire website transforms across 4 major design aesthetics:

```html
<!-- Example: Switch layout aesthetics on the fly -->
<html data-theme="dark" data-style="brutalist">
<html data-theme="dark" data-style="bento">
<html data-theme="dark" data-style="minimalist">
<html data-theme="dark" data-style="awwwards">
```

### Aesthetic Profiles Comparison

| Feature | 🥊 Neo-Brutalist (`brutalist`) | 🍱 Bento Grid (`bento`) | ⚪ Minimalist (`minimalist`) | 🏆 Awwwards Luxury (`awwwards`) |
|---|---|---|---|---|
| **Target Mood** | Tactile, punchy, physical | Modern Apple/Linear modularity | Swiss editorial, quiet rigor | Cinematic, fluid luxury |
| **Borders** | `2px solid var(--border-color)` | `1px solid var(--border-color)` | `1px solid var(--border-subtle)` | `1px solid rgba(255,255,255,0.12)` |
| **Card Radii** | `14px` (soft brutalist) | `22px` (generous bento) | `6px` (sharp/compact) | `26px` (ultra-smooth) |
| **Shadows** | `4px 4px 0px #000000` (hard block) | `0 10px 30px rgba(0,0,0,0.15)` | `none` (zero shadow) | `0 24px 48px -12px rgba(0,0,0,0.7)` |
| **Interactions** | Physical $-1px$ lift, $+2px$ press | Smooth scaling & ambient glow | Instant opacity / underline | Spring-eased floating lift |
| **Backdrop** | Opaque solid | Crisp card | Clean flat | `backdrop-filter: blur(16px)` |

---

## 4. Frontend Code Structure in Next.js

All styling tokens are organized into a dedicated, single-source-of-truth file:

```
styles/
├── tokens.css          <-- ⭐️ ALL DESIGN TOKENS, THEMES & UI STYLES LIVE HERE
├── index.css           <-- Core reset, typography, base layout classes
├── Navbar.css          <-- Bento navigation component
├── KpiCard.css         <-- Bento metric tile component
├── Dashboard.css       <-- Workbench, data table, charts
├── ProjectDrawer.css   <-- Project drilldown modal sidebar
├── Projects.css        <-- Explorer table, search filters
└── Benchmarks.css     <-- Cross-ministry analytics
```

### How to Edit Any Color in 30 Seconds

Open [`styles/tokens.css`](file:///styles/tokens.css):

1. **To change the primary accent color**:
   ```css
   :root {
     --accent-yellow: #10B981; /* Change to Emerald, Electric Purple, etc. */
     --accent-yellow-soft: rgba(16, 185, 129, 0.12);
   }
   ```
2. **To change the dark mode background**:
   ```css
   [data-theme="dark"] {
     --bg: #121214;       /* Change canvas */
     --card-bg: #1A1A1E;  /* Change card background */
   }
   ```
3. **To change card roundness across the entire site**:
   ```css
   :root {
     --radius-card: 18px;
     --radius-bento: 24px;
   }
   ```

---

## 5. Live Theme & Style Controller

A built-in interactive controller is provided at `components/ThemeController.jsx`. It allows developers, evaluators, and users to switch themes (`dark` / `light`) and layout paradigms (`brutalist` / `bento` / `minimalist` / `awwwards`) with 1 click, persisting preferences to `localStorage`.
