import React, { useEffect, useState } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'

export default function TutorReviews() {
  const { token } = useAuth()
  const [reviews, setReviews] = useState([])

  useEffect(() => { api('/api/tutor/reviews', { token }).then(setReviews) }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reviews</h1>
      <div className="grid gap-3">
        {reviews.map(r => (
          <div key={r._id} className="bg-white p-4 rounded shadow">
            <div className="font-semibold">From: {r.student?.name}</div>
            <div>⭐ {r.rating}</div>
            <div>{r.comment}</div>
          </div>
        ))}
      </div>
    </div>
  )
}