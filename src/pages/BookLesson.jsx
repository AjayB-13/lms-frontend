import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function BookLesson() {
  const { tutorId } = useParams();
  const { token } = useAuth();
  const nav = useNavigate();
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("17:00");
  const [end, setEnd] = useState("18:00");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const startTime = new Date(`${date}T${start}:00`);
      const endTime = new Date(`${date}T${end}:00`);
      await api("/api/student/lessons", {
        method: "POST",
        token,
        body: { tutorId, subject, startTime, endTime, price: 500 },
      });
      nav("/lessons");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Book Lesson</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          className="w-full border rounded p-2"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            className="border rounded p-2"
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <input
            className="border rounded p-2"
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <button className="w-full bg-blue-600 text-white rounded p-2">
          Book Lesson
        </button>
      </form>
    </div>
  );
}
