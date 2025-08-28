// frontend/src/pages/Search.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Search() {
  const [q, setQ] = useState({ subject: "", minRate: "", maxRate: "", sortBy: "rating" });
  const [tutors, setTutors] = useState([]);

  async function load() {
    const params = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => v && params.append(k, v));
    const data = await api(`/api/student/tutors?${params.toString()}`);
    setTutors(data);
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Find Tutors</h1>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <input className="border p-2 rounded" placeholder="Subject"
               value={q.subject} onChange={e=>setQ({...q, subject:e.target.value})} />
        <select className="border p-2 rounded"
                value={q.sortBy} onChange={e=>setQ({...q, sortBy:e.target.value})}>
          <option value="rating">Sort by rating</option>
          <option value="price">Sort by price</option>
        </select>
        <input className="border p-2 rounded" placeholder="Min ₹/hr"
               value={q.minRate} onChange={e=>setQ({...q, minRate:e.target.value})} />
        <input className="border p-2 rounded" placeholder="Max ₹/hr"
               value={q.maxRate} onChange={e=>setQ({...q, maxRate:e.target.value})} />
      </div>
      <button onClick={load} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      <div className="grid gap-3">
        {tutors.map(t => (
          <div key={t._id} className="bg-white p-4 rounded shadow flex items-center justify-between">
            <div>
              <div className="font-semibold">{t.user?.name}</div>
              <div className="text-sm text-gray-600">{t.subjects?.join(", ")}</div>
              
            </div>
            <div className="space-x-2">
              <Link to={`/tutor/${t._id}`} className="px-3 py-1 bg-gray-200 rounded">View</Link>
             
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
