import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Reviews() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [lessonId, setLessonId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    api("/api/student/reviews", { token }).then(setList);
  }, []);

  async function submit() {
    await api("/api/student/reviews", {
      method: "POST",
      token,
      body: { lessonId, rating, comment },
    });
    setLessonId("");
    setComment("");
    const data = await api("/api/student/reviews", { token });
    setList(data);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Reviews</h1>
      <div className="bg-white p-4 rounded shadow mb-4">
        <input
          className="border rounded p-2 w-full mb-2"
          placeholder="Lesson ID"
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value)}
        />
        <input
          className="border rounded p-2 w-full mb-2"
          placeholder="Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <select
          className="border rounded p-2 mb-2"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={submit}
        >
          Submit Review
        </button>
      </div>
      <div className="grid gap-3">
        {list.map((r) => (
          <div key={r._id} className="bg-white p-4 rounded shadow">
            <div>Lesson: {r.lesson}</div>
            <div>⭐ {r.rating}</div>
            <div>{r.comment}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
