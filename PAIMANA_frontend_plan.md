# PAIMANA — Frontend Strategy & Competitor Analysis

## 1. Is your JSON data trustworthy?

Checked your two sample records directly: `619070` and `618152` are genuinely different projects — different codes, names, agencies, states, and metrics. No duplication.

Two things to display carefully, not "fix":

- **`619070` has `revised_cost_cr` (47.44) lower than `original_cost_cr` (839)** — verified against the actual PDF, this is real government data (likely a project descope), not an extraction bug. Show it as-is. Don't hide it — it's a legitimate, interesting data point.
- **`doc_slip_months_so_far` can be negative** in rare rows (revised date earlier than target). For *display only*, clip to 0 (`Math.max(0, value)`) so it never shows a confusing "-12 months late." Keep the true value in your underlying data.

That's the entire "change" — a display-layer clamp, nothing in your pipeline needs editing.

---

## 2. Competitor analysis — Team Jugaad.exe (SIH26103)

They're solving the identical problem statement, so this is a genuinely useful reference. Here's what they built, screen by screen:

### Screens they have
1. **Main Dashboard** — KPI cards (Total Projects, High/Critical count, Predicted Cost Exposure, Current Expenditure) + a risk-distribution donut + a "Top Priority Intervention Queue" table.
2. **Implementation Risk Register** — the full project table, filterable, sortable by severity score, with **both predicted AND actual** overrun columns side by side.
3. **Project Detail page** — cost/time overrun (predicted vs actual, with error %), an overall risk badge, and a genuinely strong feature: **"Model Evidence" — a SHAP-style breakdown** showing which specific factors pushed *this project's* prediction up or down (e.g., "Existing Schedule Slippage: -0.10, pushed away from Critical").
4. **Escalation/Warning Dashboard** — tracks *changes* over time: "New Escalations," "Persistent High Risk," "Improved Projects," a warning queue filterable by New/Worsening/Persistent/Improving, plus a global feature-importance chart ("Top Emerging Drivers").
5. **Model Accuracy page** — an entire page devoted to proving the model works: MAE, R², MAPE, precision/recall/F1, predicted-vs-actual scatter plots, and a **training-window comparison** (2001-2017 vs 2001-2021 vs 2001-2022) showing the model improves with more data.

### What's genuinely strong about their approach — steal these ideas
- **Predicted vs. Actual, side by side, everywhere.** This is the single most convincing thing for a judge — it proves the model isn't just guessing, it's checked against what actually happened. You should do this too, once you have enough historical months to hold some out for testing.
- **The SHAP-style "why" panel.** Instead of just a risk score, they explain *which factor* drove it, in plain language ("Cost Acceleration pushed the prediction toward Critical"). This is explainability, and it's the strongest anti-"black box" argument you can make to a judge.
- **A dedicated accuracy/trust page.** Separating "here's the dashboard" from "here's proof our model works" is smart — it lets a technical judge dig in without cluttering the main demo.
- **Escalation tracking over time** ("New this snapshot," "Worsening," "Persistent") — this only works with multiple months of data, which you have (4 months). Worth doing.

### Red flags in their actual data — don't repeat these
- **Image 5 (Khurda Road project): `LATEST REVISED COST = ₹0 Cr`**, while `CUMULATIVE EXPENDITURE = ₹524.27 Cr` on the same card. A project cannot have spent ₹524cr against a ₹0 revised budget — this is almost certainly the exact bug we already found and fixed in our own pipeline: a missing/blank revised-cost field got defaulted to `0` instead of falling back to original cost or being left null. This is a visible, embarrassing bug sitting in their live demo screenshot. **Lesson for us: audit for `0` values in cost fields specifically — a missing value silently becoming `0` is a different bug from becoming `NaN`, and just as dangerous.**
- **Image 3: `PREDICTED TIME OVERRUN: 5688 days` (~15.6 years)** on a single project. Could be a real, extremely delayed project — India has some genuinely decades-late railway lines — but a number this large should always get a manual sanity check before it ships in a demo, exactly like we did for the 150-month slip case. No way to confirm from a screenshot alone whether this is real or a parsing bug on their end.
- Their **cost model MAPE is 121.9%** (image 8) — meaning average percentage error on cost prediction is worse than just guessing "no change." Their delay model (R²=0.80) is much stronger than their cost model (R²=0.41). This isn't necessarily wrong, just a real limitation — cost overruns are inherently noisier to predict than schedule slips. **Actionable insight for you**: if your own cost-overrun model ends up weak too, don't hide it — say so explicitly, exactly as their MAE/R² page does. Showing a weak metric honestly is more credible than pretending both models are equally strong.

### What they're NOT showing (your opportunity)
- No plain-English sentence generation (the "this project is 40% built but has spent 82% of its budget" auto-generated verdict). Their dashboard is numbers-only — yours can add a layer of readability theirs doesn't have.
- No explicit "ministry" breakdown/comparison (which sectors overrun worst) — you have clean ministry data now, they may not.

---

## 3. What data to actually show — organized by screen

### Screen 1 — Portfolio Overview (landing page)
- KPI strip: Total Projects, Total Cost Overrun (₹), % Critical+High, Total Expenditure
- Risk distribution bar/donut (Low/Medium/High/Critical counts)
- Sortable, filterable table (by ministry/state/risk_band) of all projects — this is your "Implementation Risk Register" equivalent

### Screen 2 — Project Detail (click into any row)
- Identity: name, code, agency, ministry, state
- Cost bar: original vs revised, side by side
- Metrics grid: progress %, schedule slip, cost overrun %, predicted future risk %
- **Auto-generated plain-English verdict sentence** (your differentiator vs. their numbers-only approach)
- If you add a "why" breakdown later (stretch goal): which of the 5 risk-score components (cost/schedule/progress/spend/revisions) is driving this project's score highest — you don't need real SHAP values, your own rule-based composite score already has interpretable named components, which you can show as a simple bar breakdown without doing what they did (no ML SHAP needed for this, it's just exposing math you already compute).

### Screen 3 — Early-Warning Watchlist
- Projects where `risk_band` is Low/Medium **but** `pred_proba` is high — the "looks fine today, trending risky" list
- This is your single strongest "AI vs conventional stats" argument (SIH point b) — a plain dashboard cannot produce this list, only a trained model can

### Screen 4 (stretch, if time allows) — Model Trust page
- Your own MAE/precision/recall numbers, however good or modest they are
- Say honestly which of your two models (cost vs. schedule) is stronger, same as the competitor did

---

## 4. Design directions — pick one

You asked for options beyond the brutalist-concrete one I already built. Here are four genuinely distinct directions, each grounded in the subject matter rather than generic template choices:

### A. Industrial Brutalist Ledger *(already built — the mockup I sent)*
Concrete grey, rust/amber/moss risk colors, thick black rules, monospace data. Feels like a government audit ledger crossed with a hazard-warning system. Best if your pitch angle is "serious infrastructure oversight tool."

### B. Terminal / Command-Line Aesthetic
Black background, single accent color (pick one — not neon green, that's the overused default; consider a warning-amber or signal-red), everything in monospace, ASCII-style box-drawing characters for table borders, blinking cursor accents on live data. Feels like NASA mission control or a server room dashboard. Best if your pitch angle is "real-time monitoring system," less good for a room full of non-technical policymaker judges who may find pure-terminal intimidating rather than trustworthy.

### C. Government Gazette / Official Ledger
Off-white paper background, a single deep navy or maroon accent (referencing Indian government document conventions — gazette notifications, official seals), serif headlines for gravity, actual official-looking stamps/seals as UI accents (e.g., a "VERIFIED" stamp graphic on data that's cross-checked against source PDFs). This is the most unusual, distinctive option — nobody else at SIH will look like an actual government document, which could be a genuinely memorable differentiator, and it's grounded directly in your subject matter (you're literally processing government gazette-style Flash Reports).

### D. Engineering Blueprint
Deep blueprint-blue background, white/cyan line-drawing style graphics, technical-drawing typography (think architectural drawings, dimension lines, cross-hatching for "under construction" states). Grounded in "this is a construction/engineering monitoring tool." Visually striking but riskier — could read as decorative rather than functional if not executed carefully.

**My recommendation for a hackathon judge room**: **Option A (already built) or Option C (Gazette).** Option A is safe, professional, and already exists as working code. Option C is the boldest, most memorable, and most subject-grounded — nobody else will look like an actual government document, and "we designed this to look like the official record it's built from" is a great one-line pitch to judges. If you have time, I'd build C as a second option and let your team vote.

---

## 5. Prompt for your vibe-coding AI (Antigravity / Cursor / whatever agent)

Paste this directly:

```
Build a data dashboard frontend for PAIMANA, a government infrastructure
project risk monitor. Data source: a JSON array at data/latest_snapshot.json,
one object per project, fields: project_code, project_name, agency, state,
ministry, report_month_dt, original_cost_cr, revised_cost_cr,
cumulative_expenditure_cr, physical_progress_pct, cost_overrun_ratio_so_far,
doc_slip_months_so_far, progress_gap, risk_score, risk_band,
cost_revised_up_risk_pct, schedule_slipped_risk_pct.

Build three screens:

1. PORTFOLIO OVERVIEW — KPI cards (total projects, total cost overrun sum,
   count of High+Critical, total expenditure), a risk_band distribution bar
   (Low/Medium/High/Critical), and a sortable/filterable table of all
   projects (filter by ministry, state, risk_band; sort by risk_score,
   cost_overrun_ratio_so_far, doc_slip_months_so_far).

2. PROJECT DETAIL (click any table row) — show identity fields, a bar
   comparing original_cost_cr vs revised_cost_cr, a metrics grid
   (physical_progress_pct, doc_slip_months_so_far clamped to minimum 0 for
   display, cost_overrun_ratio_so_far as %, schedule_slipped_risk_pct), and
   an auto-generated plain-English sentence built from these fields, e.g.:
   "This project is {physical_progress_pct}% complete but has already
   spent {cumulative_expenditure_cr/revised_cost_cr*100}% of its revised
   budget and is {doc_slip_months_so_far} months behind schedule."

3. EARLY-WARNING WATCHLIST — filter the table to projects where risk_band
   is "Low" or "Medium" but schedule_slipped_risk_pct or
   cost_revised_up_risk_pct is above 50 — i.e., projects that look fine
   today but the model flags as trending toward risk.

Design direction: [PASTE ONE OF THE FOUR OPTIONS ABOVE, OR SAY "use the
attached dashboard.html as the exact visual reference"].

Do not fabricate or estimate any numbers — every value must come directly
from the JSON fields listed above. If a field is missing for a project,
show "not reported," never a guessed number or a 0 standing in for missing
data.
```

That last line matters — it's a direct defense against the exact bug we found in the competitor's own demo (a missing revised cost silently rendering as ₹0).
