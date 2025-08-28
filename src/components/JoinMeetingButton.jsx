// src/components/JoinMeetingButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function JoinMeetingButton({ lessonId, role = "student", className = "" }) {
  const navigate = useNavigate();

  function handleClick() {
    if (!lessonId) return;
    navigate(`/meeting/${lessonId}?role=${encodeURIComponent(role)}`);
  }

  return (
    <button
      className={
        "px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 " + className
      }
      onClick={handleClick}
    >
      Join meeting
    </button>
  );
}
