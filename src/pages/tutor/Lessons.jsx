import React, { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";

function Badge({ value, type }) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  const styles =
    type === "status"
      ? value === "scheduled"
        ? "bg-blue-100 text-blue-800"
        : value === "completed"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800"
      : value === "paid"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  return <span className={`${base} ${styles}`}>{value}</span>;
}

export default function TutorLessons() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const params = status ? "?status=" + status : "";
      const data = await api("/api/tutor/lessons" + params, { token });
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
      <h1 className="text-2xl font-bold mb-4">My Lessons (Tutor)</h1>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <label htmlFor="status" className="text-sm font-medium text-gray-700">
          Filter by status:
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

      {/* Lessons */}
      {loading ? (
        <div className="text-gray-600">Loading lessons…</div>
      ) : list.length === 0 ? (
        <div className="p-4 bg-gray-50 border rounded text-gray-600">
          No lessons found.
        </div>
      ) : (
        <div className="grid gap-4">
          {list.map((l) => (
            <div
              key={l._id}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-lg">
                  Student: {l.student?.name || "—"}
                </div>
                <div className="flex gap-2">
                  <Badge value={l.status} type="status" />
                  <Badge value={l.paymentStatus} type="payment" />
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                {new Date(l.startTime).toLocaleString()} —{" "}
                {new Date(l.endTime).toLocaleTimeString()}
              </div>

              {/* Join meeting (opens embedded page that auto-records for tutors) */}
              <div className="flex items-center gap-3">
                {l.meetingLink ? (
                  <a
                    className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                    href={`/meeting/${l._id}?role=tutor`}
                  >
                    Join meeting
                  </a>
                ) : (
                  <span className="text-xs text-gray-500">
                    No meeting link yet
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
