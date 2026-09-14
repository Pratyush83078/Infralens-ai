import pandas as pd
import joblib

def export_latest_snapshot():
    df = pd.read_parquet("data/processed/full_panel.parquet")
    latest = df.sort_values("report_month_dt").groupby("project_code").tail(1)

    out_cols = [
        "project_code", "project_name", "agency", "state", "ministry",
        "report_month_dt", "original_cost_cr", "revised_cost_cr",
        "cumulative_expenditure_cr", "physical_progress_pct",
        "cost_overrun_ratio_so_far", "doc_slip_months_so_far",
        "progress_gap", "risk_score", "risk_band",
    ]
    export = latest[out_cols].copy()

    for target in ["cost_revised_up_label", "schedule_slipped_label"]:
        model = joblib.load(f"data/processed/{target}_gradient_boosting.joblib")
        feat_df = latest[model.feature_names_in_]
        export[f"{target}_pred_proba"] = model.predict_proba(feat_df)[:, 1]

    export.to_json("data/processed/latest_snapshot.json", orient="records", date_format="iso")
    print(f"Exported {len(export)} projects to data/processed/latest_snapshot.json")

if __name__ == "__main__":
    export_latest_snapshot()