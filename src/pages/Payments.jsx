// src/pages/Payments.jsx
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

// Currencies with no minor units (don’t divide by 100)
const ZERO_DECIMAL = new Set([
  "BIF","CLP","DJF","GNF","JPY","KMF","KRW","MGA","PYG","RWF","UGX","VND","VUV","XAF","XOF","XPF"
]);

function formatMoney(amount, currency = "INR") {
  const cur = (currency || "INR").toUpperCase();
  let n = Number(amount) || 0;
  if (!ZERO_DECIMAL.has(cur)) {
    if (Number.isInteger(n)) n = n / 100; // paise → rupees
  }
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: cur,
      minimumFractionDigits: ZERO_DECIMAL.has(cur) ? 0 : 2,
      maximumFractionDigits: ZERO_DECIMAL.has(cur) ? 0 : 2,
    }).format(n);
  } catch {
    // Fallback if unsupported currency code
    return `${cur} ${n}`;
  }
}

function StatusBadge({ status }) {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  const styles =
    status === "paid"
      ? "bg-green-100 text-green-800"
      : status === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : status === "failed"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-800";
  return <span className={`${base} ${styles}`}>{status || "unknown"}</span>;
}

export default function Payments() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [reconciling, setReconciling] = useState(null); // payment _id while reconciling

  const fetchList = useCallback(() => {
    setError("");
    return api("/api/payments/my", { token })
      .then((res) => setList(Array.isArray(res) ? res : []))
      .catch((e) => setError(e.message || "Failed to load payments"));
  }, [token]);

  // Initial load
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Success-page reconciliation: handle ?session_id=... once
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const sid = sp.get("session_id");
    if (!sid) return;

    (async () => {
      try {
        setInfo("Confirming your payment...");
        await api(`/api/payments/confirm?session_id=${encodeURIComponent(sid)}`, { token });
        setInfo("Payment confirmed.");
        await fetchList();
      } catch (e) {
        setError(e.message || "Payment confirm failed");
      } finally {
        // Clean query param from URL
        const url = new URL(window.location.href);
        url.searchParams.delete("session_id");
        window.history.replaceState({}, "", url.toString());
        setTimeout(() => setInfo(""), 2000);
      }
    })();
  }, [token, fetchList]);

  // Manual recheck for a given payment row (uses providerSessionId)
  const recheckPayment = async (payment) => {
    if (!payment?.providerSessionId) return;
    try {
      setReconciling(payment._id);
      setInfo("Rechecking with Stripe...");
      await api(`/api/payments/confirm?session_id=${encodeURIComponent(payment.providerSessionId)}`, { token });
      await fetchList();
    } catch (e) {
      setError(e.message || "Recheck failed");
    } finally {
      setReconciling(null);
      setTimeout(() => setInfo(""), 1500);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Payment History</h1>

      {info && <div className="mb-3 text-sm px-3 py-2 rounded bg-blue-50 text-blue-800">{info}</div>}
      {error && <div className="mb-3 text-sm px-3 py-2 rounded bg-red-50 text-red-800">{error}</div>}

      {list.length === 0 ? (
        <div className="text-gray-600">No payments yet.</div>
      ) : (
        <div className="grid gap-2">
          {list.map((p) => {
            const amountLabel = formatMoney(p.amount, p.currency);
            const created = p.createdAt ? new Date(p.createdAt).toLocaleString() : "";
            const canRecheck =
              p?.provider === "stripe" &&
              p?.status !== "paid" &&
              !!p?.providerSessionId;

            return (
              <div key={p._id} className="bg-white p-4 rounded shadow">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-lg font-semibold">{amountLabel}</div>
                  <StatusBadge status={p.status} />
                </div>

                <div className="mt-1 text-sm text-gray-700 flex flex-wrap items-center gap-2">
                  <span className="uppercase">{p.currency}</span>
                  <span>·</span>
                  <span>{p.provider || "—"}</span>
                  {/* Session ID intentionally hidden from UI */}
                </div>

                <div className="text-sm text-gray-600">{created}</div>

                {canRecheck && (
                  <div className="mt-3">
                    <button
                      onClick={() => recheckPayment(p)}
                      disabled={reconciling === p._id}
                      className={`px-3 py-1 rounded text-sm border ${
                        reconciling === p._id
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:bg-gray-50"
                      }`}
                      title="Ask the server to confirm payment status with Stripe"
                    >
                      {reconciling === p._id ? "Rechecking..." : "Recheck with Stripe"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
