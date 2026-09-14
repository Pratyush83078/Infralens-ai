import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, classification_report
import joblib

FEATURES = [
    "original_cost_cr", "planned_duration_m", "age_m", "elapsed_frac",
    "progress_gap", "expenditure_util_pct", "spend_vs_progress_gap",
    "doc_already_slipped", "doc_slip_months_so_far", "progress_velocity",
    "cost_revision_count_cum", "doc_revision_count_cum", "agency_avg_overrun",
]

def train_and_compare(df, target):
    data = df.dropna(subset=[target] + FEATURES)
    X, y = data[FEATURES], data[target].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    results = {}
    for name, model in [
        ("logistic_regression", LogisticRegression(max_iter=1000, class_weight="balanced")),
        ("gradient_boosting", GradientBoostingClassifier(random_state=42)),
    ]:
        model.fit(X_train, y_train)
        proba = model.predict_proba(X_test)[:, 1]
        auc = roc_auc_score(y_test, proba)
        results[name] = auc
        print(f"\n=== {name} ===  AUC: {auc:.3f}")
        print(classification_report(y_test, model.predict(X_test)))
        joblib.dump(model, f"data/processed/{target}_{name}.joblib")

    return results

if __name__ == "__main__":
    df = pd.read_parquet("data/processed/full_panel.parquet")
    print("=== Cost overrun early-warning ===")
    train_and_compare(df, "cost_revised_up_label")
    print("\n=== Schedule slip early-warning ===")
    train_and_compare(df, "schedule_slipped_label")