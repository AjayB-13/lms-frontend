import React, { useRef, useState } from "react";

export default function MeetingRecorder({ lessonId, token, apiBase }) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState("");

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  function pickMime() {
    const prefs = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ];
    for (const mt of prefs) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(mt)) return mt;
    }
    return ""; // let browser pick
  }

  async function startRecording() {
    try {
      // Ask to record THIS TAB. For audio, prefer "Chrome Tab" + "Share tab audio".
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });

      const mimeType = pickMime();
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      streamRef.current = stream;

      rec.ondataavailable = (e) => {
        // Will also fire once more after stop()
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      // When stopped, wait a tick to be sure the final dataavailable has fired
      rec.onstop = async () => {
        await new Promise((r) => setTimeout(r, 0)); // microtask flush
       
        const size = chunksRef.current.reduce((s,b)=>s+(b?.size||0),0);
        console.log('Blob size before upload:', size);

        if (!size) {
          alert(
            "No media was captured. Try selecting the Chrome Tab that has the meeting and check “Share tab audio”."
          );
          // stop tracks
          try { stream.getTracks().forEach((t) => t.stop()); } catch {}
          setRecording(false);
          return;
        }

        const blob = new Blob(chunksRef.current, { type: mimeType || "video/webm" });
        await uploadBlob(blob);

        // Stop tracks after upload request is fired
        try { stream.getTracks().forEach((t) => t.stop()); } catch {}
        setRecording(false);
      };

      rec.start(1000); // gather data each second
      recorderRef.current = rec;
      setRecording(true);
    } catch (e) {
      alert(`Could not start recording: ${e.message}`);
    }
  }

  async function stopRecording() {
    try {
      const rec = recorderRef.current;
      if (rec && rec.state !== "inactive") {
        rec.stop();
      } else {
        alert("Not recording.");
      }
    } catch (e) {
      alert(`Could not stop recording: ${e.message}`);
    }
  }

  async function uploadBlob(blob) {
    try {
      setUploading(true);
      const form = new FormData();
      form.append("lessonId", lessonId);
      form.append("notes", note || "");
      form.append("file", blob, `lesson-${lessonId}-${Date.now()}.webm`);

      const res = await fetch(`${apiBase}/api/recordings/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Upload failed (${res.status})`);

      alert("Recording uploaded successfully ✅");
      setNote("");
    } catch (e) {
      alert(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed left-4 bottom-4 z-50 bg-white/90 backdrop-blur rounded-xl shadow p-3 flex items-center gap-2">
      <input
        className="border rounded px-2 py-1 text-sm"
        placeholder="Notes (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={recording || uploading}
      />
      {!recording ? (
        <button
          className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          onClick={startRecording}
          disabled={uploading}
          title='Choose the meeting Chrome tab and tick "Share tab audio"'
        >
          Start recording
        </button>
      ) : (
        <button
          className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
          onClick={stopRecording}
          disabled={uploading}
        >
          Stop & Upload
        </button>
      )}
      {uploading && <span className="text-sm text-gray-700">Uploading…</span>}
    </div>
  );
}
