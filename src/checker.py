import pandas as pd

df = pd.read_parquet("data/processed/full_panel.parquet")

print("=== BASICS ===")
print("Total rows:", len(df))
print("Unique projects:", df["project_code"].nunique())
print("Months:", sorted(df["report_month"].unique()))

print("\n=== MISSING CRITICAL FIELDS ===")
for c in ["project_code", "project_name", "original_cost_cr", "revised_cost_cr", "physical_progress_pct", "state"]:
    n = df[c].isna().sum()
    print(f"{c}: {n} missing ({100*n/len(df):.2f}%)")

print("\n=== MINISTRY / SECTOR STATUS ===")
if "ministry" in df.columns:
    print("ministry missing:", df["ministry"].isna().sum())
    print(df["ministry"].value_counts().head(15))
else:
    print("NO 'ministry' column found — patch not applied yet")
if "sector" in df.columns:
    print("WARNING: 'sector' column still exists — should have been removed")

print("\n=== SUSPICIOUS COST VALUES ===")
bad_cost = df[df["revised_cost_cr"] < df["original_cost_cr"] * 0.5]
print(f"{len(bad_cost)} rows across {bad_cost['project_code'].nunique()} unique projects "
      f"where revised cost < 50% of original")

print("\n=== PROGRESS OUT OF RANGE ===")
bad_prog = df[(df["physical_progress_pct"] < 0) | (df["physical_progress_pct"] > 100)]
print(f"{len(bad_prog)} rows with progress outside 0-100%")

print("\n=== NEGATIVE SCHEDULE SLIP (should never happen) ===")
if "doc_slip_months_so_far" in df.columns:
    neg = df[df["doc_slip_months_so_far"] < 0]
    print(f"{len(neg)} rows with negative slip")

print("\n=== RISK BAND SPREAD ===")
print(df["risk_band"].value_counts())

print("\n=== NAME EXTRACTION FAILURES ===")
bad_names = df[df["project_name"].isna() | (df["project_name"].str.len() < 5)]
print(f"{len(bad_names)} rows with missing/too-short project names")