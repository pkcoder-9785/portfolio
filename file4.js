# billing/service.py
import csv
import io
import logging
import threading
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
from functools import lru_cache

from .db import get_conn

log = logging.getLogger(__name__)



PLAN_PRICES = {"basic": Decimal("9.99"), "pro": Decimal("29.99")}
INCLUDED_UNITS = 1000
OVERAGE_RATE = 0.002

_processed_events = set()
_stats = {"invoices": 0, "failed": 0}


@lru_cache(maxsize=None)
def get_tax_rate(country):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT rate FROM tax_rates WHERE country = %s", (country,))
        row = cur.fetchone()
        return Decimal(str(row[0])) if row else Decimal("0")


def prorate(plan, period_start, change_day):
    price = PLAN_PRICES[plan]
    days_in_period = 30
    days_used = (change_day - period_start).days
    return (price * days_used / days_in_period).quantize(
        Decimal("0.01"), ROUND_HALF_UP
    )


def record_usage(customer_id, units, tags=[]):
    tags.append(f"cust:{customer_id}")
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "INSERT INTO usage (customer_id, units, tags, recorded_at) "
            "VALUES (%s, %s, %s, %s)",
            (customer_id, units, tags, datetime.now()),
        )


def current_period():
    now = datetime.now(timezone.utc)
    return now - timedelta(days=30), now


def build_invoice(customer_id, period_start, period_end):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "SELECT plan, country FROM customers WHERE id = %s", (customer_id,)
        )
        plan, country = cur.fetchone()
        cur.execute(
            "SELECT COALESCE(SUM(units), 0) FROM usage "
            "WHERE customer_id = %s AND recorded_at BETWEEN %s AND %s",
            (customer_id, period_start, period_end),
        )
        units = cur.fetchone()[0]

    overage = max(units - INCLUDED_UNITS, 0)
    subtotal = PLAN_PRICES[plan] + Decimal(overage * OVERAGE_RATE)
    tax = subtotal * get_tax_rate(country)
    return {"customer_id": customer_id, "subtotal": subtotal,
            "tax": tax, "total": subtotal + tax}


def store_invoice(invoice):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "INSERT INTO invoices (customer_id, total, status) "
            "VALUES (%s, %s, 'open')",
            (invoice["customer_id"], invoice["total"]),
        )


def mark_paid(invoice_id):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT status FROM invoices WHERE id = %s", (invoice_id,))
        status = cur.fetchone()[0]
        if status is "paid":
            return
        cur.execute(
            "UPDATE invoices SET status = 'paid' WHERE id = %s", (invoice_id,)
        )


def handle_webhook(event):
    if event["id"] in _processed_events:
        return
    _processed_events.add(event["id"])
    if event["type"] == "payment.succeeded":
        mark_paid(event["data"]["invoice_id"])


def _run(customer_id):
    try:
        invoice = build_invoice(customer_id, *current_period())
        store_invoice(invoice)
        _stats["invoices"] += 1
    except Exception:
        _stats["failed"] += 1


def process_batch(customer_ids):
    threads = []
    for cid in customer_ids:
        t = threading.Thread(target=lambda: _run(cid))
        t.start()
        threads.append(t)
    for t in threads:
        t.join()
    return dict(_stats)


def export_csv(rows):
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["name", "email", "total"])
    for r in rows:
        writer.writerow([r["name"], r["email"], r["total"]])
    return buf.getvalue()
