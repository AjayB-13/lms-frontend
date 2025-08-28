import React, { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";

// format INR / currencies safely
function formatMoney(amount, currency = "INR") {
  if (!amount) return "₹0.00";
  const n = Number(amount) / 100; // paise → rupees
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(n);
}

function StatusBadge({ value }) {
  const base =
    "px-2 py-0.5 rounded text-xs font-medium capitalize inline-block";
  const styles =
    value === "paid"
      ? "bg-green-100 text-green-800"
      : value === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";
  return <span className={`${base} ${styles}`}>{value}</span>;
}

export default function AdminPayments() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({ totalPaid: 0, count: 0 });

  useEffect(() => {
    (async () => {
      try {
        const data = await api("/api/payments", { token });
        setRows(data);

        // calculate summary: only paid rows
        const paidRows = data.filter((p) => p.status === "paid");
        const total = paidRows.reduce((sum, p) => sum + (p.amount || 0), 0);
        setSummary({ totalPaid: total, count: paidRows.length });
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Payments (Stripe)</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-500">Total Paid</div>
          <div className="text-xl font-semibold mt-1">
            {formatMoney(summary.totalPaid, "INR")}
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-500">Paid Payments</div>
          <div className="text-xl font-semibold mt-1">{summary.count}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-500">All Payments</div>
          <div className="text-xl font-semibold mt-1">{rows.length}</div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow border border-gray-200">
          <thead>
            <tr className="bg-gray-50 text-left border-b">
              <th className="p-2">Created</th>
              <th className="p-2">Student</th>
              <th className="p-2">Tutor</th>
              <th className="p-2">Lesson</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Provider</th>
              <th className="p-2">Session ID</th>
              <th className="p-2">Payment Intent</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p._id} className="border-b hover:bg-gray-50">
                <td className="p-2 text-sm">
                  {new Date(p.createdAt).toLocaleString()}
                </td>
                <td className="p-2 text-sm">
                  {p.student?.name || "—"}
                  <div className="text-xs text-gray-600">{p.student?.email}</div>
                </td>
                <td className="p-2 text-sm">
                  {p.tutor?.name || "—"}
                  <div className="text-xs text-gray-600">{p.tutor?.email}</div>
                </td>
                <td className="p-2 text-sm">{p.lesson?.subject || "—"}</td>
                <td className="p-2 font-medium">
                  {formatMoney(p.amount, p.currency)}
                </td>
                <td className="p-2">
                  <StatusBadge value={p.status} />
                </td>
                <td className="p-2 text-sm uppercase">{p.provider}</td>
                <td className="p-2">
                  <code className="text-xs">{p.providerSessionId}</code>
                </td>
                <td className="p-2">
                  <code className="text-xs">{p.stripePaymentIntent}</code>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  className="p-4 text-center text-gray-600"
                  colSpan={9}
                >
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
