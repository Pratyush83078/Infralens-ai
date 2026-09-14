import pandas as pd
def build_labels(df, horizon=3):
    df = df.sort_values(["project_code", "report_month_dt"]).copy()
    g = df.groupby("project_code")

    # look horizon months INTO THE FUTURE relative to each row
    df["revised_cost_future"] = g["revised_cost_cr"].shift(-horizon)
    df["revised_doc_future"] = g["revised_doc"].shift(-horizon)

    df["cost_revised_up_label"] = (
        df["revised_cost_future"] > df["revised_cost_cr"] * 1.001
    ).astype(int)
    df["schedule_slipped_label"] = (
        df["revised_doc_future"] > df["revised_doc"]
    ).astype(int)

    # rows with no future data (last `horizon` months of the panel) get no
    # valid label -> drop them at training time, don't zero-fill them
    df.loc[df["revised_cost_future"].isna(), "cost_revised_up_label"] = pd.NA
    df.loc[df["revised_doc_future"].isna(), "schedule_slipped_label"] = pd.NA
    return df