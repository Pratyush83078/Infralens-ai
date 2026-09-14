# import pandas as pd
# from data_loader import load_all_months, clean_panel
# from features import add_snapshot_features, add_velocity_features, compute_risk_score, add_sector_dummies
# from labels import build_labels

# def build_full_panel(horizon=3):
#     df = clean_panel(load_all_months())
#     df = add_snapshot_features(df)
#     df = add_velocity_features(df)
#     df = compute_risk_score(df)
#     df = build_labels(df, horizon=horizon)
#     df = add_sector_dummies(df)
#     return df

# if __name__ == "__main__":
#     df = build_full_panel()
#     df.to_parquet("data/processed/full_panel.parquet", index=False)
#     print("Rows:", len(df))
#     print("\ncost_revised_up_label:\n", df["cost_revised_up_label"].value_counts(dropna=False))
#     print("\nschedule_slipped_label:\n", df["schedule_slipped_label"].value_counts(dropna=False))
#     print("\nrisk_band:\n", df["risk_band"].value_counts())
import pandas as pd
from data_loader import load_all_months, clean_panel
from features import add_snapshot_features, add_velocity_features, compute_risk_score, add_sector_dummies
from labels import build_labels

def build_full_panel(horizon=1, velocity_window=1):
    df = clean_panel(load_all_months())
    df = add_snapshot_features(df)
    df = add_velocity_features(df, window=velocity_window)
    df = compute_risk_score(df)
    df = build_labels(df, horizon=horizon)
    df = add_sector_dummies(df)
    return df

if __name__ == "__main__":
    df = build_full_panel()
    df.to_parquet("data/processed/full_panel.parquet", index=False)
    print("Rows:", len(df))
    print("\ncost_revised_up_label:\n", df["cost_revised_up_label"].value_counts(dropna=False))
    print("\nschedule_slipped_label:\n", df["schedule_slipped_label"].value_counts(dropna=False))
    print("\nrisk_band:\n", df["risk_band"].value_counts())