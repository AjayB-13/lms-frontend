import React, { useEffect, useState } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'

export default function TutorProfile() {
  const { token } = useAuth()
  const [form, setForm] = useState({ subjects: '', hourlyRate: '', bio: '', qualifications: '', experienceYears: '' })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api('/api/tutor/profile', { token }).then(p => {
      if (p) setForm({
        subjects: (p.subjects||[]).join(', '),
        hourlyRate: p.hourlyRate || '',
        bio: p.bio || '',
        qualifications: p.qualifications || '',
        experienceYears: p.experienceYears || ''
      })
    })
  }, [])

  async function save() {
    const payload = {
      subjects: form.subjects.split(',').map(s=>s.trim()).filter(Boolean),
      hourlyRate: Number(form.hourlyRate) || 0,
      bio: form.bio,
      qualifications: form.qualifications,
      experienceYears: Number(form.experienceYears) || 0
    }
    await api('/api/tutor/profile', { method: 'POST', token, body: payload })
    setMsg('Saved!'); setTimeout(()=>setMsg(''),1500)
  }

  function input(k) { return e => setForm({ ...form, [k]: e.target.value }) }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Tutor Profile</h1>
      <label className="block">Subjects</label>
      <input className="w-full border p-2 rounded mb-2" value={form.subjects} onChange={input('subjects')} />
      <label className="block">Hourly Rate (₹)</label>
      <input className="w-full border p-2 rounded mb-2" value={form.hourlyRate} onChange={input('hourlyRate')} />
      <label className="block">Bio</label>
      <textarea className="w-full border p-2 rounded mb-2" value={form.bio} onChange={input('bio')} />
      <label className="block">Qualifications</label>
      <input className="w-full border p-2 rounded mb-2" value={form.qualifications} onChange={input('qualifications')} />
      <label className="block">Experience (years)</label>
      <input className="w-full border p-2 rounded mb-2" value={form.experienceYears} onChange={input('experienceYears')} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={save}>Save</button>
      {msg && <span className="ml-3 text-green-600">{msg}</span>}
    </div>
  )
}