import pandas as pd
import numpy as np

def month_diff(d1, d2):
    if pd.isna(d1) or pd.isna(d2):
        return np.nan
    return (d2.year - d1.year) * 12 + (d2.month - d1.month)

def add_snapshot_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["planned_duration_m"] = df.apply(
        lambda r: month_diff(r["start_date"], r["target_doc"]), axis=1)
    df["age_m"] = df.apply(
        lambda r: month_diff(r["start_date"], r["report_month_dt"]), axis=1)
    df["elapsed_frac"] = (df["age_m"] / df["planned_duration_m"]).clip(lower=0)
    df["expected_progress_pct"] = (df["elapsed_frac"] * 100).clip(upper=100)
    df["progress_gap"] = df["physical_progress_pct"] - df["expected_progress_pct"]

    df["cost_overrun_ratio_so_far"] = (
        (df["revised_cost_cr"] - df["original_cost_cr"]) / df["original_cost_cr"]
    )
    df["expenditure_util_pct"] = 100 * df["cumulative_expenditure_cr"] / df["revised_cost_cr"]
    df["spend_vs_progress_gap"] = df["expenditure_util_pct"] - df["physical_progress_pct"]

    df["doc_slip_months_so_far"] = df.apply(
        lambda r: month_diff(r["target_doc"], r["revised_doc"])
        if pd.notna(r["revised_doc"]) else 0, axis=1)
    df["doc_already_slipped"] = (df["doc_slip_months_so_far"].fillna(0) > 0).astype(int)
    return df

def add_velocity_features(df: pd.DataFrame, window: int = 3) -> pd.DataFrame:
    df = df.sort_values(["project_code", "report_month_dt"]).copy()
    g = df.groupby("project_code")

    df["progress_pct_prev"] = g["physical_progress_pct"].shift(window)
    df["progress_velocity"] = (
        (df["physical_progress_pct"] - df["progress_pct_prev"]) / window
    )

    df["revised_cost_prev"] = g["revised_cost_cr"].shift(1)
    df["cost_revision_flag"] = (df["revised_cost_cr"] > df["revised_cost_prev"]).astype(int)
    df["cost_revision_count_cum"] = g["cost_revision_flag"].cumsum()

    df["revised_doc_prev"] = g["revised_doc"].shift(1)
    df["doc_pushed_flag"] = (df["revised_doc"] > df["revised_doc_prev"]).astype(int)
    df["doc_revision_count_cum"] = g["doc_pushed_flag"].cumsum()

    # NOTE: mean includes the row itself -> mild leakage, fine for MVP.
    # Harden later with a time-aware expanding mean per agency.
    df["agency_avg_overrun"] = df.groupby("agency")["cost_overrun_ratio_so_far"].transform("mean")
    return df

def _norm(s: pd.Series) -> pd.Series:
    return (s - s.min()) / (s.max() - s.min() + 1e-9)

def compute_risk_score(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    cost_risk     = _norm(df["cost_overrun_ratio_so_far"].clip(lower=0).fillna(0))
    schedule_risk = _norm(df["doc_slip_months_so_far"].clip(lower=0).fillna(0))
    progress_risk = _norm((-df["progress_gap"]).clip(lower=0).fillna(0))
    spend_risk    = _norm(df["spend_vs_progress_gap"].clip(lower=0).fillna(0))
    revision_risk = _norm(df["cost_revision_count_cum"].fillna(0))

    df["risk_score"] = 100 * (
        0.30 * cost_risk + 0.25 * schedule_risk + 0.25 * progress_risk
        + 0.10 * spend_risk + 0.10 * revision_risk
    )
    df["risk_band"] = pd.cut(df["risk_score"], bins=[-1, 25, 50, 75, 101],
                              labels=["Low", "Medium", "High", "Critical"])
    return df

def add_sector_dummies(df: pd.DataFrame) -> pd.DataFrame:
    df = pd.get_dummies(df, columns=["sector"], prefix="sector", dummy_na=True)
    return df

