import pandas as pd
import numpy as np
from pathlib import Path

RAW_DIR = Path("data/raw")
OUT_PATH = Path("data/processed/panel.parquet")

def parse_mmyyyy(s):
    if pd.isna(s) or str(s).strip() in ("-", "", "NA", "N/A"):
        return pd.NaT
    try:
        mm, yyyy = str(s).strip().split("/")
        return pd.Timestamp(year=int(yyyy), month=int(mm), day=1)
    except Exception:
        return pd.NaT

def clean_numeric(s):
    if pd.isna(s):
        return np.nan
    s = str(s).replace(",", "").strip()
    if s in ("-", "", "NA"):
        return np.nan
    try:
        return float(s)
    except ValueError:
        return np.nan

def load_all_months(raw_dir: Path = RAW_DIR) -> pd.DataFrame:
    files = sorted(raw_dir.glob("*.csv"))
    if not files:
        raise FileNotFoundError(f"No CSVs found in {raw_dir}")
    frames = [pd.read_csv(f, dtype=str) for f in files]
    return pd.concat(frames, ignore_index=True)

def clean_panel(panel: pd.DataFrame) -> pd.DataFrame:
    df = panel.copy()

    for col in ["original_cost_cr", "revised_cost_cr",
                "cumulative_expenditure_cr", "physical_progress_pct"]:
        df[col] = df[col].apply(clean_numeric)

    for col in ["approval_date", "start_date", "target_doc", "revised_doc"]:
        df[col] = df[col].apply(parse_mmyyyy)

    df["report_month_dt"] = pd.to_datetime(df["report_month"], format="%B%Y", errors="coerce")
    df["project_code"] = df["project_code"].astype(str).str.strip()

    df = df.drop_duplicates(subset=["project_code", "report_month_dt"], keep="last")
    df = df.sort_values(["project_code", "report_month_dt"]).reset_index(drop=True)
    return df

if __name__ == "__main__":
    panel = clean_panel(load_all_months())
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    panel.to_parquet(OUT_PATH, index=False)
    print(f"{panel['project_code'].nunique()} projects, "
          f"{panel['report_month_dt'].nunique()} months, {len(panel)} rows")

