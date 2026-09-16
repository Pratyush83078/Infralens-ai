Paimana Dashboard: Neo-Brutalist & Bento Grid Design System

This document serves as the absolute source of truth for the AI agent (Antigravity IDE) and developers working on the Paimana Dashboard.

Core Directive: The UI must reflect a "Soft Neo-Brutalist" combined with a "Bento Grid" layout—heavily inspired by Gumroad. It must feel tactile, bold, structured, and fun, completely avoiding the clinical, generic "enterprise dashboard" look.

1. The Design Language & Styling Rules

A. Borders and Shadows (The "Tactile" Rule)

Borders: All cards, buttons, and distinct UI elements must have a thick, solid black border.

Tailwind: border-2 border-black (or border-[3px] for larger hero components).

Shadows: Absolutely NO soft, blurred drop shadows (never use shadow-md or shadow-lg). All shadows must be hard, offset, and solid black.

Tailwind: shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]

Corners: To keep the brutalism "soft" and approachable, retain rounded corners.

Tailwind: rounded-xl or rounded-2xl depending on card size.

B. Color Palette

App Background: A warm, muted off-white/cream to reduce eye strain and make the crisp white cards pop.

Hex: #F3F2EF or #F9F9F8

Bento Cards: Stark white for maximum contrast against the black borders.

Hex: #FFFFFF

Accent Colors (Use Deliberately):

Critical/Alerts: Bold Yellow (e.g., #FFD500) or Harsh Orange.

Success/Low Risk: Sharp Mint Green (#22C55E) or Lime.

Primary Actions: Vibrant Purple, Pink, or Blue (must always have black text and black borders).

C. Typography

Font Family: Swap standard sans-serifs for something with more geometric character (e.g., Space Grotesk, Syne, or Inter at heavy weights).

Headers: Uppercase, heavily weighted, tight tracking.

Tailwind: font-black uppercase tracking-tight text-black

Data/Stats: Large, bold, and unapologetic (e.g., text-4xl font-black).

D. Interactive Elements (Buttons & Links)

Buttons must physically "press down" into their shadow when clicked.

Tailwind state: active:translate-x-[2px] active:translate-y-[2px] active:shadow-none

Transition: transition-all duration-100

2. Layout & Component Architecture

A. Bento Grid Structure

Use CSS Grid natively via Tailwind (grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6).

Cards should span varying column/row sizes to create the "Bento" look, but they must align perfectly on a strict grid to maintain order.

Example: col-span-1 md:col-span-2

B. Charting & Stats (Tremor / Recharts)

Standard chart libraries look out of place if left default. When generating Recharts or Tremor components:

Force SVG lines and strokes to be thick (e.g., strokeWidth={2} or 3).

Force primary stroke colors to be #000000.

Tooltips must match the card styling (thick border, hard shadow, square/slightly rounded corners).

Donut charts should have thick dividers between segments.

3. Antigravity AI Agent Workflow

To the AI Agent reading this: You are tasked with "vibe coding" this dashboard. You must prioritize these design rules over default generic component generations.

Skill Utilization Protocol

When generating code or refactoring the Paimana dashboard, utilize the installed skills from the .agents/skills/ directory in this specific order:

Architecture & Scoping:

Run grill-me or to-spec before implementing complex interactive tables or multi-step risk filtering. Clarify the data flow first.

Use codebase-design to map out where new Bento Card components should live within the React tree.

Frontend Generation & Styling:

Use ponytail as your primary frontend builder. Instruct it explicitly: "Apply the design.md Neo-Brutalism Tailwind rules to all components."

Use impeccable to ensure the responsive grid doesn't break on mobile viewports.

Refinement & Troubleshooting:

If UI breaks or Playwright tests fail, invoke diagnosing-bugs.

Before finishing a turn, run code-review and ponytail-review to ensure no soft shadows (shadow-md, shadow-lg) or thin gray borders snuck into the codebase.

TypeScript Integrity:

Ensure all new props for the Bento cards follow strict types using setup-ts-deep-modules.

Refactoring Prompts for the User

User, when you want me to build a specific part of the screen, use prompts like:

"Use ponytail to build the 'Infrastructure Risk Command Centre' header block according to design.md"

"Add a new Bento card for the 'Ministry Cost Overrun Ranking' using Recharts, ensure it has the Gumroad vibe defined in design.md"