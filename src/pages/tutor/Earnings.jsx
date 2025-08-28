import React, { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";

// Currencies with no minor units (don’t divide by 100)
const ZERO_DECIMAL = new Set([
  "BIF","CLP","DJF","GNF","JPY","KMF","KRW","MGA","PYG","RWF","UGX","VND","VUV","XAF","XOF","XPF"
]);

function formatMoney(amount, currency = "INR") {
  const cur = (currency || "INR").toUpperCase();
  let n = Number(amount) || 0;

  // Convert minor → major units unless zero-decimal
  if (!ZERO_DECIMAL.has(cur) && Number.isFinite(n)) {
    // Your backend stores amounts in minor units (e.g., paise), so divide by 100
    n = n / 100;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: ZERO_DECIMAL.has(cur) ? 0 : 2,
    maximumFractionDigits: ZERO_DECIMAL.has(cur) ? 0 : 2,
  }).format(n);
}

function StatusBadge({ status }) {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  const styles =
    status === "paid"
      ? "bg-green-100 text-green-800"
      : status === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-gray-100 text-gray-800";
  return <span className={`${base} ${styles}`}>{status || "unknown"}</span>;
}

export default function TutorEarnings() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/api/tutor/earnings", { token })
      .then(setData)
      .catch((e) => setErr(e.message || "Failed to load"));
  }, [token]);

  if (err) {
    return (
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Earnings</h1>
        <div className="text-red-600">{err}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-6 rounded shadow animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="h-5 w-64 bg-gray-200 rounded mb-3" />
        <div className="h-5 w-52 bg-gray-200 rounded mb-6" />
        <div className="h-5 w-full bg-gray-200 rounded mb-2" />
        <div className="h-5 w-3/4 bg-gray-200 rounded" />
      </div>
    );
  }

  const cur = (data.summary?.currency || "INR").toUpperCase();
  const totalLabel = formatMoney(data.summary?.total || 0, cur);
  const count = data.summary?.count ?? 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-4">Earnings</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-500">Total Paid</div>
          <div className="text-2xl font-semibold mt-1">{totalLabel}</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-500">Payments Count</div>
          <div className="text-2xl font-semibold mt-1">{count}</div>
        </div>
        <div className="p-4 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-500">Currency</div>
          <div className="text-2xl font-semibold mt-1">{cur}</div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">Recent payments</h2>

      {(!data.payments || data.payments.length === 0) ? (
        <div className="p-4 rounded-lg bg-gray-50 text-gray-600">
          No payments yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-sm font-medium text-gray-600 px-4 py-2">Amount</th>
                <th className="text-left text-sm font-medium text-gray-600 px-4 py-2">Status</th>
                <th className="text-left text-sm font-medium text-gray-600 px-4 py-2">Provider</th>
                <th className="text-left text-sm font-medium text-gray-600 px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.payments.map((p) => {
                const amt = formatMoney(p.amount, p.currency || cur);
                const date = p.createdAt ? new Date(p.createdAt).toLocaleString() : "";
                return (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{amt}</td>
                    <td className="px-4 py-2"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-2 uppercase text-gray-700">{p.provider || "—"}</td>
                    <td className="px-4 py-2 text-gray-700">{date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
