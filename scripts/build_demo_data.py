"""
Demo arayüzü için veri paketi üretir.

Girdi : data/marketing_messages_full.csv + ham Berka tabloları (trans, account, card, disp, loan, order, client, district)
Çıktı : demo/public/data/messages.json          -> ana sayfadaki mesaj havuzu
        demo/public/data/accounts/<id>.json     -> müşteri analizi sayfası için aylık panel ve ürün bilgileri

Aylık panel, exploratory_data_analysis.ipynb'deki tanımla aynıdır:
credit = type == PRIJEM, debit = diğer tüm tipler, bakiye = ayın son işlemindeki bakiye.

Çalıştırma:  .venv/bin/python scripts/build_demo_data.py
"""

import ast
import json
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OUT = ROOT / "demo" / "public" / "data"


def berka_date(series):
    return pd.to_datetime(series.astype(str).str[:6], format="%y%m%d")


def spending_category(row_type, operation, k_symbol):
    if k_symbol == "SIPO":
        return "household"
    if k_symbol == "UVER":
        return "loan"
    if k_symbol == "POJISTNE":
        return "insurance"
    if k_symbol in ("SLUZBY", "SANKC. UROK"):
        return "fees"
    if operation == "VYBER KARTOU":
        return "card"
    if operation == "VYBER" or row_type == "VYBER":
        return "cash"
    return "transfer"


def income_category(operation, k_symbol):
    if k_symbol == "DUCHOD":
        return "pension"
    if k_symbol == "UROK":
        return "interest"
    if operation == "VKLAD":
        return "deposit"
    return "transfer"


SPEND_CATS = ["household", "loan", "insurance", "fees", "card", "cash", "transfer"]
INCOME_CATS = ["transfer", "pension", "deposit", "interest"]


def clean(value):
    if value is None:
        return None
    if isinstance(value, (np.bool_, bool)):
        return bool(value)
    if isinstance(value, (np.integer, int)):
        return int(value)
    if isinstance(value, (np.floating, float)):
        return None if np.isnan(value) else round(float(value), 2)
    return value


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "accounts").mkdir(exist_ok=True)

    msgs = pd.read_csv(DATA / "marketing_messages_full.csv")
    empty = msgs["message"].isna() | (msgs["message"].astype(str).str.strip() == "")
    if empty.any():
        print(f"Uyarı: mesajı boş {empty.sum()} satır atlandı -> hesap {msgs.loc[empty, 'account_id'].tolist()}")
    msgs = msgs[~empty].reset_index(drop=True)
    triggers = pd.read_csv(DATA / "trigger_table_final.csv")
    account_ids = set(msgs["account_id"])

    # --- ana sayfa mesaj havuzu: trigger tablosundaki ürün sahipliği bilgisiyle zenginleştir ---
    product_cols = ["account_id", "year_month", "has_loan", "loan_status", "has_card", "card_type", "account_age_months"]
    msgs = msgs.merge(triggers[product_cols], on=["account_id", "year_month"], how="left")

    records = []
    for i, r in msgs.iterrows():
        try:
            evidence = ast.literal_eval(r["evidence"]) if isinstance(r["evidence"], str) else {}
        except (ValueError, SyntaxError):
            evidence = {}
        records.append({
            "id": i,
            "account_id": int(r["account_id"]),
            "year_month": r["year_month"],
            "trigger_type": r["trigger_type"],
            "channel": r["channel"],
            "message": r["message"],
            "is_supplemental": bool(r["is_supplemental"]),
            "provider": r["provider"],
            "model": r["model"],
            "confidence": clean(r["confidence"]),
            "suggested_product": r["suggested_product"],
            "evidence": {k: clean(v) for k, v in evidence.items()},
            "gender": r["gender"],
            "age": clean(r["age_at_trigger"]),
            "district": r["district_name"],
            "avg_salary": clean(r["avg_salary"]),
            "offer_rate": clean(r["offer_rate"]),
            "has_card": clean(r["has_card"]),
            "card_type": clean(r["card_type"]),
            "has_loan": clean(r["has_loan"]),
            "loan_status": clean(r["loan_status"]),
            "account_age_months": clean(r["account_age_months"]),
        })
    (OUT / "messages.json").write_text(json.dumps(records, ensure_ascii=False, allow_nan=False))
    print(f"messages.json: {len(records)} mesaj")

    # --- müşteri analizi: ham tablolar ---
    trans = pd.read_csv(DATA / "trans.csv", sep=";", low_memory=False)
    trans = trans[trans["account_id"].isin(account_ids)].copy()
    trans["date"] = berka_date(trans["date"])
    trans["year_month"] = trans["date"].dt.strftime("%Y-%m")
    trans["k_symbol"] = trans["k_symbol"].astype(str).str.strip().replace({"nan": None, "": None})
    trans["operation"] = trans["operation"].fillna("")
    trans["credit"] = np.where(trans["type"] == "PRIJEM", trans["amount"], 0.0)
    trans["debit"] = np.where(trans["type"] != "PRIJEM", trans["amount"], 0.0)
    trans["category"] = [
        income_category(op, ks) if t == "PRIJEM" else spending_category(t, op, ks)
        for t, op, ks in zip(trans["type"], trans["operation"], trans["k_symbol"])
    ]
    trans = trans.sort_values(["account_id", "date", "trans_id"])

    panel = (
        trans.groupby(["account_id", "year_month"])
        .agg(income=("credit", "sum"), spending=("debit", "sum"), balance=("balance", "last"),
             min_balance=("balance", "min"), n=("trans_id", "count"))
        .reset_index()
    )
    spend_by_cat = (
        trans[trans["debit"] > 0].pivot_table(index=["account_id", "year_month"], columns="category",
                                               values="debit", aggfunc="sum", fill_value=0)
        .reindex(columns=SPEND_CATS, fill_value=0).add_prefix("s_").reset_index()
    )
    income_by_cat = (
        trans[trans["credit"] > 0].pivot_table(index=["account_id", "year_month"], columns="category",
                                                values="credit", aggfunc="sum", fill_value=0)
        .reindex(columns=INCOME_CATS, fill_value=0).add_prefix("i_").reset_index()
    )
    panel = (
        panel.merge(spend_by_cat, on=["account_id", "year_month"], how="left")
        .merge(income_by_cat, on=["account_id", "year_month"], how="left")
        .fillna(0)
    )

    account = pd.read_csv(DATA / "account.csv", sep=";")
    account["date"] = berka_date(account["date"])
    district = pd.read_csv(DATA / "district.csv", sep=";").rename(columns={
        "A1": "district_id", "A2": "district_name", "A3": "region", "A11": "avg_salary",
        "A12": "unemployment_95", "A13": "unemployment_96"})
    disp = pd.read_csv(DATA / "disp.csv", sep=";")
    card = pd.read_csv(DATA / "card.csv", sep=";")
    card["issued"] = berka_date(card["issued"])
    card = card.merge(disp[["disp_id", "account_id"]], on="disp_id")
    loan = pd.read_csv(DATA / "loan.csv", sep=";")
    loan["date"] = berka_date(loan["date"])
    orders = pd.read_csv(DATA / "order.csv", sep=";")
    orders["k_symbol"] = orders["k_symbol"].astype(str).str.strip().replace({"nan": None, "": None})

    account = account.merge(district[["district_id", "district_name", "region", "avg_salary",
                                      "unemployment_96"]], on="district_id", how="left")
    account_idx = account.set_index("account_id")
    disp_counts = disp.groupby("account_id")["type"].apply(list).to_dict()
    cards_by_acc = card.groupby("account_id")
    loans_by_acc = loan.set_index("account_id")
    orders_by_acc = orders.groupby("account_id")
    triggers_by_acc = triggers[triggers["account_id"].isin(account_ids)].groupby("account_id")
    msgs_by_acc = msgs.groupby("account_id")
    panel_by_acc = panel.groupby("account_id")

    for acc_id in sorted(account_ids):
        acc = account_idx.loc[acc_id]
        rows = panel_by_acc.get_group(acc_id)
        months = []
        for m in rows.to_dict("records"):
            months.append({
                "ym": m["year_month"],
                "income": round(m["income"], 2),
                "spending": round(m["spending"], 2),
                "balance": round(m["balance"], 2),
                "min_balance": round(m["min_balance"], 2),
                "n": int(m["n"]),
                "spend": {c: round(m[f"s_{c}"], 2) for c in SPEND_CATS if m[f"s_{c}"] > 0},
                "inc": {c: round(m[f"i_{c}"], 2) for c in INCOME_CATS if m[f"i_{c}"] > 0},
            })

        acc_cards = []
        if acc_id in cards_by_acc.groups:
            for _, c in cards_by_acc.get_group(acc_id).iterrows():
                acc_cards.append({"type": c["type"], "issued": c["issued"].strftime("%Y-%m-%d")})

        acc_loan = None
        if acc_id in loans_by_acc.index:
            l = loans_by_acc.loc[acc_id]
            acc_loan = {"date": l["date"].strftime("%Y-%m-%d"), "amount": clean(l["amount"]),
                        "duration": clean(l["duration"]), "payments": clean(l["payments"]),
                        "status": l["status"]}

        acc_orders = []
        if acc_id in orders_by_acc.groups:
            for _, o in orders_by_acc.get_group(acc_id).iterrows():
                acc_orders.append({"k_symbol": o["k_symbol"], "amount": clean(o["amount"]),
                                   "bank_to": o["bank_to"]})

        acc_triggers = []
        if acc_id in triggers_by_acc.groups:
            for _, t in triggers_by_acc.get_group(acc_id).sort_values("year_month").iterrows():
                acc_triggers.append({"ym": t["year_month"], "type": t["trigger_type"],
                                     "confidence": clean(t["confidence"])})

        owner = msgs_by_acc.get_group(acc_id).iloc[0]
        payload = {
            "account_id": int(acc_id),
            "opened": acc["date"].strftime("%Y-%m-%d"),
            "frequency": acc["frequency"],
            "district": acc["district_name"],
            "region": acc["region"],
            "district_avg_salary": clean(acc["avg_salary"]),
            "district_unemployment": clean(pd.to_numeric(acc["unemployment_96"], errors="coerce")),
            "gender": owner["gender"],
            "users": disp_counts.get(acc_id, []),
            "cards": acc_cards,
            "loan": acc_loan,
            "orders": acc_orders,
            "triggers": acc_triggers,
            "months": months,
        }
        (OUT / "accounts" / f"{acc_id}.json").write_text(json.dumps(payload, ensure_ascii=False, allow_nan=False))

    print(f"accounts/: {len(account_ids)} müşteri dosyası -> {OUT / 'accounts'}")


if __name__ == "__main__":
    main()
