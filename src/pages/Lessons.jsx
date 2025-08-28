// src/pages/Lessons.jsx
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import JoinMeetingButton from "../components/JoinMeetingButton";
import LeaveReviewModal from "../components/LeaveReviewModal";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Formats a number as INR. If the number looks like paise (e.g., 50000), convert to rupees.
function formatINR(value) {
  let n = Number(value) || 0;
  if (n >= 1000 && Number.isInteger(n) && n % 100 === 0) n = n / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export default function Lessons() {
  const { token } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reviewLesson, setReviewLesson] = useState(null);

  // Load lessons (wait for token)
  const load = useCallback(async () => {
    if (!token) return;
    setError("");
    try {
      const data = await api("/api/student/lessons", { token });
      setLessons(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load lessons");
    }
  }, [token]);

  // Reconcile after Stripe redirect (via ?session_id=... or saved id)
  const reconcileIfNeeded = useCallback(async () => {
    if (!token) return;

    const url = new URL(window.location.href);
    let sessionId = url.searchParams.get("session_id");

    // Fallback to the id we saved before redirect
    if (!sessionId) {
      sessionId = sessionStorage.getItem("lastCheckoutSessionId");
    }
    if (!sessionId) return;

    try {
      setMessage("Confirming payment...");
      const result = await api(
        `/api/payments/confirm?session_id=${encodeURIComponent(sessionId)}`,
        { token }
      );

      if (result?.status === "paid") {
        setMessage("Payment confirmed ✔️");
        // clear saved id once confirmed
        sessionStorage.removeItem("lastCheckoutSessionId");
      } else if (result?.pi_status === "processing") {
        setMessage("Payment is processing… this will update shortly.");
      } else {
        setMessage(`Payment status: ${result?.status || "pending"}`);
      }

      // Clean URL only if it actually had session_id
      if (url.searchParams.has("session_id")) {
        url.searchParams.delete("session_id");
        window.history.replaceState({}, "", url.toString());
      }

      await load(); // refresh lessons so paymentStatus becomes "paid"
    } catch (e) {
      setError(e.message || "Payment confirm failed");
    } finally {
      setTimeout(() => setMessage(""), 2500);
    }
  }, [token, load]);

  // Load lessons when token is ready / changes
  useEffect(() => {
    load();
  }, [load]);

  // Run reconciliation once token is ready
  useEffect(() => {
    reconcileIfNeeded();
  }, [reconcileIfNeeded]);

  async function cancelLesson(id) {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      await api(`/api/student/lessons/${id}`, {
        method: "PUT",
        token,
        body: { status: "canceled" },
      });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function rescheduleLesson(id) {
    if (!token) return;
    const date = prompt("New date (YYYY-MM-DD):");
    const start = prompt("New start time (HH:MM):");
    const end = prompt("New end time (HH:MM):");
    if (!date || !start || !end) return;
    const startTime = new Date(`${date}T${start}:00`);
    const endTime = new Date(`${date}T${end}:00`);

    setLoading(true);
    setError("");
    try {
      await api(`/api/student/lessons/${id}`, {
        method: "PUT",
        token,
        body: { startTime, endTime },
      });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function payNow(lessonId) {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const { id, url } = await api("/api/payments/create-checkout-session", {
        method: "POST",
        token,
        body: { lessonId },
      });

      // Save the session id so we can reconcile even if URL param is missing
      if (id) sessionStorage.setItem("lastCheckoutSessionId", id);

      if (url) {
        window.location.href = url;
      } else {
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({ sessionId: id });
        if (error) setError(error.message);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // When clicking the disabled watermark review
  function explainWhyDisabled(l) {
    const parts = [];
    if (l.status !== "completed") parts.push("complete the meeting");
    if (l.paymentStatus !== "paid") parts.push("pay for the class");
    const msg =
      parts.length > 0
        ? `Please ${parts.join(" and ")} to leave a review.`
        : "You can leave a review now.";
    alert(msg);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">My Lessons</h1>

      {message && <div className="mb-2 text-green-700">{message}</div>}
      {error && <div className="mb-2 text-red-600">{error}</div>}

      <div className="grid gap-3">
        {lessons.map((l) => {
          const showReviewBtn = !l.reviewed; // show button until they’ve reviewed
          const reviewReady =
            l.status === "completed" && l.paymentStatus === "paid";

          return (
            <div key={l._id} className="bg-white p-4 rounded shadow">
              <div className="font-semibold">{l.subject || "Lesson"}</div>
              <div>
                {new Date(l.startTime).toLocaleString()} —{" "}
                {new Date(l.endTime).toLocaleTimeString()}
              </div>

              <div>
                Status: {l.status} · Payment: {l.paymentStatus} · Price:{" "}
                {formatINR(l.price || 0)}
              </div>

              <div className="mt-2 flex gap-2 flex-wrap items-center">
                {/* Join meeting (JaaS JWT) */}
                <JoinMeetingButton lessonId={l._id} />

                {/* Review button is always visible (watermarked if not allowed yet) */}
                {showReviewBtn && (
                  <button
                    title={
                      reviewReady
                        ? "Leave a review"
                        : "Complete the meeting and pay to leave a review"
                    }
                    aria-disabled={!reviewReady}
                    onClick={() =>
                      reviewReady ? setReviewLesson(l) : explainWhyDisabled(l)
                    }
                    className={
                      reviewReady
                        ? "px-3 py-1 rounded bg-emerald-600 text-white"
                        : // watermarked style
                          "px-3 py-1 rounded bg-emerald-600/40 text-white/70 cursor-not-allowed"
                    }
                  >
                    {reviewReady ? "Review this lesson" : "Review (locked)"}
                  </button>
                )}

                {/* Manage */}
                {l.status !== "canceled" && (
                  <>
                    <button
                      className="px-3 py-1 rounded bg-gray-200"
                      onClick={() => rescheduleLesson(l._id)}
                      disabled={loading}
                    >
                      Reschedule
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-gray-200"
                      onClick={() => cancelLesson(l._id)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </>
                )}

                {/* Pay now */}
                {l.paymentStatus !== "paid" && l.status === "scheduled" && (
                  <button
                    className="px-3 py-1 rounded bg-blue-600 text-white"
                    onClick={() => payNow(l._id)}
                    disabled={loading}
                  >
                    Pay now (Card)
                  </button>
                )}
              </div>

              {/* Small helper text under the disabled review button */}
              {showReviewBtn && !reviewReady && (
                <div className="text-sm text-gray-500 mt-1">
                  Review is unlocked after the class is{" "}
                  <span className="font-medium">completed by tutor and student</span> 
                  <span className="font-medium">paid</span>.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Review modal */}
      {reviewLesson && (
        <LeaveReviewModal
          lesson={reviewLesson}
          onSaved={load}
          onClose={() => setReviewLesson(null)}
        />
      )}
    </div>
  );
}
