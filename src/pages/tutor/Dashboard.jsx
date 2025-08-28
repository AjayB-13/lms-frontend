import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';   // ⬅️ assuming you store tutor info in AuthContext
import TutorReviewsPanel from '../../components/TutorReviewsPanel'; // ⬅️ NEW

export default function Dashboard() {
  const { me } = useAuth(); // ⬅️ ensure your AuthContext provides tutor info

  return (
    <div className="grid gap-3">
      <h1 className="text-2xl font-bold">Tutor Dashboard</h1>
      <div className="flex gap-2 flex-wrap">
        <Link to="/tutor/profile" className="px-3 py-2 bg-gray-200 rounded">Profile</Link>
        <Link to="/tutor/availability" className="px-3 py-2 bg-gray-200 rounded">Availability</Link>
        <Link to="/tutor/lessons" className="px-3 py-2 bg-gray-200 rounded">Lessons</Link>
        <Link to="/tutor/recordings" className="px-3 py-2 bg-gray-200 rounded">Recordings</Link>
        <Link to="/tutor/earnings" className="px-3 py-2 bg-gray-200 rounded">Earnings</Link>
        <Link to="/tutor/reviews" className="px-3 py-2 bg-gray-200 rounded">Reviews</Link>
      </div>

      {/* Reviews Panel */}
      {me && <TutorReviewsPanel tutorId={me._id} />}
    </div>
  );
}
