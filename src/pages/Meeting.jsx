// src/pages/Meeting.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MeetingRecorder from "../components/MeetingRecorder";

export default function Meeting() {
  const { lessonId } = useParams();
  const [q] = useSearchParams();
  const role = q.get("role") || "student";
  const { token } = useAuth();

  const box = useRef(null);
  const [err, setErr] = useState("");
  const AUTO_REC = import.meta.env.VITE_JAAS_AUTOREC === "1";

  useEffect(() => {
    let api;
    let completedOnce = false; // prevent double calls

    (async () => {
      try {
        const room = `lesson-${lessonId}`;
        const base = import.meta.env.VITE_API_BASE || "";

        const r = await fetch(
          `${base}/api/jaas/token?room=${encodeURIComponent(room)}&role=${encodeURIComponent(role)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await r.json().catch(async () => {
          const text = await r.text();
          throw new Error(`Token endpoint returned non-JSON (${r.status}): ${text.slice(0,120)}…`);
        });
        if (!r.ok) throw new Error(data.message || `Token error (${r.status})`);

        // Ensure Jitsi IFrame API is available
        if (!window.JitsiMeetExternalAPI) {
          await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://8x8.vc/external_api.js";
            s.onload = resolve; s.onerror = reject;
            document.body.appendChild(s);
          });
        }

        // JaaS room is <appId>/<room>
        const fullRoomName = `${data.appId}/${room}`;

        api = new window.JitsiMeetExternalAPI(data.domain || "8x8.vc", {
          roomName: fullRoomName,
          parentNode: box.current,
          jwt: data.token,
          width: "100%",
          height: "100%",
          // keep the UI simple; we are using our own recorder UI
          configOverwrite: {
            prejoinPageEnabled: true,
            fileRecordingsEnabled: false,
            liveStreamingEnabled: false,
          },
          toolbarButtons: [
            "microphone",
            "camera",
            "desktop",
            "chat",
            "participants-pane",
            "tileview",
            "hangup",
          ],
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "desktop",
              "chat",
              "participants-pane",
              "tileview",
              "hangup",
            ],
          },
        });

        // --- mark lesson complete when meeting ends (tutor only) ---
        const baseUrl = import.meta.env.VITE_API_BASE || "";
        const completeLesson = async () => {
          if (completedOnce) return;
          if (role !== "tutor") return;
          completedOnce = true;
          try {
            await fetch(`${baseUrl}/api/tutor/lessons/${lessonId}/complete`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch {
            // swallow
          }
        };
        api.addEventListener("readyToClose", completeLesson);
        window.addEventListener("beforeunload", completeLesson);

        // --- OPTIONAL: try to auto-start JaaS cloud recording (if your plan allows it) ---
        let started = false;
        const tryStart = async () => {
          if (!AUTO_REC || started || role !== "tutor") return;
          try {
            await api.executeCommand("startRecording", { mode: "file" });
            started = true;
          } catch {
            // plan may not include JaaS cloud recording; ignore
          }
        };
        api.addEventListener("videoConferenceJoined", tryStart);
        api.addEventListener("participantRoleChanged", (e) => {
          if (e?.role === "moderator") tryStart();
        });

      } catch (e) {
        setErr(e.message);
      }
    })();

    return () => {
      // Jitsi disposes itself with the iframe removal.
    };
  }, [lessonId, role, token, AUTO_REC]);

  return (
    <div style={{ height: "100vh" }}>
      {err && <div className="p-3 text-red-600">{err}</div>}
      <div ref={box} style={{ height: "100%", width: "100%" }} />
      {role === "tutor" && (
        <MeetingRecorder
          lessonId={lessonId}
          token={token}
          apiBase={import.meta.env.VITE_API_BASE || ""}
        />
      )}
    </div>
  );
}
