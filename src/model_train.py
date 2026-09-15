import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.metrics import roc_auc_score, average_precision_score, classification_report
import joblib

FEATURES = [
    "original_cost_cr", "planned_duration_m", "age_m", "elapsed_frac",
    "progress_gap", "expenditure_util_pct", "spend_vs_progress_gap",
    "doc_already_slipped", "doc_slip_months_so_far", "progress_velocity",
    "cost_revision_count_cum", "doc_revision_count_cum", "agency_avg_overrun",
]

def train_and_compare(df, target):
    # Handle infinite values safely and drop rows without target labels
    df_clean = df.replace([np.inf, -np.inf], np.nan)
    data = df_clean.dropna(subset=[target])
    X, y = data[FEATURES], data[target].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    models = [
        (
            "logistic_regression",
            Pipeline([
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
                ("clf", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)),
            ]),
        ),
        (
            "gradient_boosting",
            Pipeline([
                ("imputer", SimpleImputer(strategy="median")),
                ("clf", GradientBoostingClassifier(random_state=42)),
            ]),
        ),
    ]

    results = {}
    for name, model in models:
        model.fit(X_train, y_train)
        proba = model.predict_proba(X_test)[:, 1]
        auc = roc_auc_score(y_test, proba)
        ap = average_precision_score(y_test, proba)
        results[name] = {"roc_auc": auc, "pr_auc": ap}

        print(f"\n=== {name.upper()} === | ROC-AUC: {auc:.3f} | PR-AUC: {ap:.3f}")
        y_pred = model.predict(X_test)
        print(classification_report(y_test, y_pred, digits=3))

        model_path = f"data/processed/{target}_{name}.joblib"
        joblib.dump(model, model_path)
        print(f"Saved model to {model_path}")

    return results

if __name__ == "__main__":
    df = pd.read_parquet("data/processed/full_panel.parquet")
    print("==================================================")
    print("1. COST OVERRUN EARLY-WARNING MODEL")
    print("==================================================")
    train_and_compare(df, "cost_revised_up_label")

    print("\n==================================================")
    print("2. SCHEDULE SLIP EARLY-WARNING MODEL")
    print("==================================================")
    train_and_compare(df, "schedule_slipped_label")