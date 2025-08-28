import React, { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function LeaveReviewModal({ lesson, onSaved, onClose }) {
  const { token } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  async function save() {
    try {
      await api('/api/reviews', {
        method: 'POST',
        token,
        body: { lessonId: lesson._id, rating, comment }
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded shadow max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Review {lesson.subject}</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}

        <label className="block mb-2">Rating (1–5)</label>
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
          className="border p-2 w-full mb-3"
        />

        <label className="block mb-2">Comment</label>
        <textarea
          className="border p-2 w-full mb-3"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded" onClick={save}>
            Submit
          </button>
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
