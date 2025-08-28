import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";

function fmt(dt) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return "";
  }
}

export default function TutorRecordings() {
  const { token } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);

  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedLesson = useMemo(
    () => lessons.find((l) => l._id === selectedId),
    [lessons, selectedId]
  );

  async function loadLessons() {
    try {
      const data = await api("/api/tutor/lessons", { token });
      setLessons(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load lessons");
    }
  }

  async function loadRecordings() {
    try {
      const data = await api("/api/recordings/my", { token });
      setRows(data);
    } catch (e) {
      setError(e.message || "Failed to load recordings");
    }
  }

  useEffect(() => {
    loadLessons();
    loadRecordings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateLink() {
    if (!selectedId) return setError("Select a lesson first");
    setError("");
    setMsg("");
    setBusy(true);
    try {
      await api("/api/recordings/meeting-link", {
        method: "POST",
        token,
        body: { lessonId: selectedId },
      });
      setMsg("Meeting link generated and saved to the lesson.");
      await loadLessons();
    } catch (e) {
      setError(e.message || "Failed to generate meeting link");
    } finally {
      setBusy(false);
    }
  }

  async function uploadRecording() {
    if (!selectedId) return setError("Select a lesson");
    if (!file) return setError("Choose a video file to upload");

    setError("");
    setMsg("");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("lessonId", selectedId);
      form.append("notes", notes);
      form.append("file", file);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/recordings/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Upload failed (${res.status})`);

      setMsg("Uploaded to Cloudinary successfully.");
      setFile(null);
      setNotes("");
      await loadRecordings();
    } catch (e) {
      setError(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this recording?")) return;
    setError("");
    setMsg("");
    setBusy(true);
    try {
      await api("/api/recordings/" + id, { method: "DELETE", token });
      await loadRecordings();
    } catch (e) {
      setError(e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tutor Recordings</h1>

      {msg && <div className="text-green-700 mb-3">{msg}</div>}
      {error && <div className="text-red-600 mb-3">{error}</div>}

      <div className="bg-white rounded shadow p-4 mb-6">
        <div className="grid gap-3">
          <label className="text-sm">Select lesson</label>
          <select
            className="border p-2 rounded"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">-- choose a lesson --</option>
            {lessons.map((l) => (
              <option key={l._id} value={l._id}>
                {l.subject || "Lesson"} · {fmt(l.startTime)} — {fmt(l.endTime)}
              </option>
            ))}
          </select>

          <div className="grid gap-3 md:grid-cols-3 mt-2">
            <input
              className="border p-2 rounded md:col-span-2"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-2 rounded bg-indigo-600 text-white"
              onClick={generateLink}
              disabled={busy || !selectedId}
            >
              Generate meeting link
            </button>
            <button
              className="px-3 py-2 rounded bg-blue-600 text-white"
              onClick={uploadRecording}
              disabled={busy || !selectedId || !file}
            >
              Upload recording
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {rows.map((r) => (
          <div key={r._id} className="bg-white rounded shadow p-4">
            <div className="font-semibold">{r?.lesson?.subject || "Lesson"}</div>
            <div className="text-sm text-gray-600">
              {new Date(r.createdAt).toLocaleString()}
              {r.duration ? ` · ${Math.round(r.duration)}s` : ""}
            </div>

            {r.url && (
              <video className="w-full mt-3 rounded" src={r.url} controls />
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
              <button className="text-red-600" onClick={() => remove(r._id)}>
                Delete
              </button>
            </div>

            {r.notes && <div className="mt-2 text-gray-800">{r.notes}</div>}
          </div>
        ))}

        {rows.length === 0 && (
          <div className="text-gray-600">No recordings yet.</div>
        )}
      </div>
    </div>
  );
}
