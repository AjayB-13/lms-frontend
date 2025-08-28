import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function TutorReviewsPanel({ tutorId }) {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api(`/api/reviews/tutor/${tutorId}`, { token }).then(setReviews);
  }, [tutorId]);

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-xl font-bold mb-3">Student Reviews</h2>
      {reviews.length === 0 && <div className="text-gray-600">No reviews yet.</div>}
      <div className="grid gap-3">
        {reviews.map(r => (
          <div key={r._id} className="border-b pb-2">
            <div className="font-semibold">{r.student?.name}</div>
            <div className="text-yellow-600">Rating: {r.rating} / 5</div>
            <div className="text-sm text-gray-700">{r.comment}</div>
            <div className="text-xs text-gray-500">
              {new Date(r.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
