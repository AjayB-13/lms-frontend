import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";

export default function TutorDetails() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      // cache-buster so we don’t see a stale response after a new review
      const ts = Date.now();
      const tutorData = await api(`/api/student/tutors/${id}?t=${ts}`);
      const reviewsData = await api(`/api/student/tutors/${id}/reviews?t=${ts}`);

      setProfile(tutorData?.profile || null);
      setAvailability(tutorData?.availability || []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (e) {
      setErr(e.message || "Failed to load tutor");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh again if user returns to the tab (helps after leaving a review elsewhere)
  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  // Compute live average from current reviews so the page updates instantly
  const liveAvg = useMemo(() => {
    if (!reviews.length) return null;
    const sum = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0);
    return sum / reviews.length;
  }, [reviews]);

  const liveCount = reviews.length;

  if (loading) return <div>Loading…</div>;
  if (err) return <div className="text-red-600">{err}</div>;
  if (!profile) return <div>No tutor found.</div>;

  const displayRating =
    liveAvg != null ? `${liveAvg.toFixed(1)}` :
    (profile.rating != null ? `${Number(profile.rating).toFixed?.(1) || profile.rating}` : "0.0");

  const displayCount = liveCount || profile.reviewCount || 0;

  return (
    <div className="grid gap-6">
      <div className="bg-white p-6 rounded shadow">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{profile.user?.name}</h1>
            {profile.bio && <p className="text-gray-600">{profile.bio}</p>}
            <p className="mt-2">
              Subjects: {Array.isArray(profile.subjects) ? profile.subjects.join(", ") : "—"}
            </p>
            <p className="mt-1">
              ₹{profile.hourlyRate}/hr · ⭐ {displayRating} ({displayCount} reviews)
            </p>
          </div>

          <div className="flex gap-2">
            <button
              className="px-3 py-2 bg-gray-100 rounded border"
              onClick={load}
              title="Refresh"
            >
              Refresh
            </button>
            <Link
              to={`/book/${profile.user?._id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Book a lesson
            </Link>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Availability</h2>
        {availability.length === 0 ? (
          <div className="text-gray-600">No available slots listed.</div>
        ) : (
          <ul className="list-disc ml-6">
            {availability.slice(0, 20).map((slot, i) => (
              <li key={i}>{new Date(slot).toLocaleString()}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Student Reviews</h2>
        {reviews.length === 0 ? (
          <div className="text-gray-600">No reviews yet.</div>
        ) : (
          <div className="grid gap-3">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white p-4 rounded shadow">
                <div className="font-semibold">
                  From: {r.student?.name || "Student"}
                </div>
                <div>⭐ {r.rating}</div>
                {r.comment && <div className="mt-1">{r.comment}</div>}
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(r.createdAt).toLocaleString?.() || ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
