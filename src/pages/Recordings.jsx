import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Recordings() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await api("/api/recordings/my", { token });
      setRows(data);
    } catch (e) {
      setError(e.message || "Failed to load recordings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lesson Recordings</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading && <div className="text-gray-600 mb-2">Loading…</div>}

      <div className="grid gap-4">
        {rows.map((r) => (
          <div key={r._id} className="bg-white rounded shadow p-4">
            <div className="font-semibold">{r?.lesson?.subject || "Lesson"}</div>
            <div className="text-sm text-gray-600">
              {new Date(r.createdAt).toLocaleString()}
              {r.duration ? ` · ${Math.round(r.duration)}s` : ""}
            </div>

            {r.url && (
              <video
                className="w-full mt-3 rounded"
                src={r.url}
                controls
                playsInline
              />
            )}

            <div className="mt-2 flex gap-4">
              <a
                className="text-blue-600 underline"
                href={r.url}
                target="_blank"
                rel="noreferrer"
              >
                Open
              </a>
              <a className="text-blue-600 underline" href={r.url} download>
                Download
              </a>
            </div>

            {r.notes && <div className="mt-2 text-gray-800">{r.notes}</div>}
          </div>
        ))}

        {!loading && rows.length === 0 && (
          <div className="text-gray-600">No recordings yet.</div>
        )}
      </div>
    </div>
  );
}
