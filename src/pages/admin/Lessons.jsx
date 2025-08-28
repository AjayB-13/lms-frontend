import React, { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";

function StatusBadge({ value }) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize";
  const styles =
    value === "scheduled"
      ? "bg-blue-100 text-blue-800"
      : value === "completed"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  return <span className={`${base} ${styles}`}>{value}</span>;
}

function PaymentBadge({ value }) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize";
  const styles =
    value === "paid"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  return <span className={`${base} ${styles}`}>{value}</span>;
}

export default function AdminLessons() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const params = status ? "?status=" + status : "";
      const data = await api("/api/admin/lessons" + params, { token });
      setList(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin · Lessons</h1>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-5">
        <label
          htmlFor="status"
          className="text-sm font-medium text-gray-700 whitespace-nowrap"
        >
          Filter:
        </label>
        <select
          id="status"
          className="border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>

      {/* Lessons list */}
      {loading ? (
        <div className="text-gray-600">Loading lessons…</div>
      ) : list.length === 0 ? (
        <div className="p-4 rounded bg-gray-50 text-gray-600">
          No lessons found.
        </div>
      ) : (
        <div className="grid gap-4">
          {list.map((l) => (
            <div
              key={l._id}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              {/* Top row: subject + date/time */}
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-lg">
                  {l.subject || "Lesson"}
                </div>
                <div className="flex gap-2">
                  <StatusBadge value={l.status} />
                  <PaymentBadge value={l.paymentStatus} />
                </div>
              </div>

              {/* Date/Time */}
              <div className="text-sm text-gray-600 mb-2">
                {new Date(l.startTime).toLocaleString()} –{" "}
                {new Date(l.endTime).toLocaleTimeString()}
              </div>

              {/* Participants */}
              <div className="text-sm text-gray-700">
                <span className="font-medium">Student:</span>{" "}
                {l.student?.name || l.student || "—"} ·{" "}
                <span className="font-medium">Tutor:</span>{" "}
                {l.tutor?.name || l.tutor || "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
